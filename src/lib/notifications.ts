import nodemailer, { type Transporter, type TransportOptions } from 'nodemailer';
import { getConfigBackupSettings, getNtfyConfig, getServerInfoById, getSMTPConfig, getNotificationTemplates, isDailySummaryEnabled } from './db-utils';
import { NotificationTemplate, Backup, BackupStatus, BackupKey, SMTPConnectionType, SupportedTemplateLanguage, NotificationDeliveryOutcome } from './types';
import { defaultNotificationTemplates } from './default-config';
import { isDevelopmentMode } from './utils';
import { formatDateTime } from './date-format';
import { formatInteger, formatBytes as formatBytesLocale } from './number-format';
import { SOURCE_LOCALE } from './locales';
import { getServerI18nForLanguage } from './i18n-server';
import { htmlList, renderMarkdownEmail, renderMarkdownNtfyText } from './notification-template-renderer';
import {
  NTFY_MESSAGE_MAX_BYTES,
  truncateNtfyAtLineBoundary,
} from './notification-template-validation';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export interface NotificationContext {
  server_id: string;
  server_name: string;
  server_alias: string;
  server_note: string;
  server_url: string;
  backup_name: string;
  backup_date: string;
  status: BackupStatus;
  messages_count: number;
  warnings_count: number;
  errors_count: number;
  duration: string;
  file_count: number;
  file_size: string | number; // raw bytes or formatted size; formatted with locale before send
  uploaded_size: string | number;
  storage_size: string | number;
  available_versions: number;
  log_text?: string; // Plain text, one item per line (warnings + errors only)
}

/** Options for {@link extractLogText} when building short NTFY bodies. */
export interface ExtractLogTextOptions {
  /** Keep only the human message (first line / after `]: `), truncate length, and cap entry count. */
  compact?: boolean;
  maxEntries?: number;
  maxEntryLength?: number;
}

const DUPLICATI_LEVEL_RE = /\[(Warning|Error|Fatal)-/i;
const DEFAULT_NTFY_LOG_MAX_ENTRIES = 15;
const DEFAULT_NTFY_LOG_ENTRY_LENGTH = 300;

function parseJsonStringArray(raw: string | null | undefined): string[] {
  if (!raw || raw.trim() === '') {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
      .map((item) => item.trim());
  } catch {
    return [];
  }
}

/** True when a Duplicati log line is Warning, Error, or Fatal (not Information). */
export function isWarningOrErrorLogLine(line: string): boolean {
  return DUPLICATI_LEVEL_RE.test(line);
}

/**
 * Shorten a log entry for push notifications: first line only, prefer the message
 * after Duplicati's `]: ` marker, and cap length.
 */
export function summarizeLogEntryForNtfy(entry: string, maxLength: number = DEFAULT_NTFY_LOG_ENTRY_LENGTH): string {
  const firstLine = entry.split(/\r?\n/)[0]?.trim() ?? '';
  if (!firstLine) {
    return '';
  }
  const marker = ']: ';
  const idx = firstLine.indexOf(marker);
  let summary = idx >= 0 ? firstLine.slice(idx + marker.length).trim() : firstLine;
  if (!summary) {
    summary = firstLine;
  }
  if (summary.length <= maxLength) {
    return summary;
  }
  return `${summary.slice(0, Math.max(0, maxLength - 1))}…`;
}

export interface OverdueBackupContext {
  server_id: string; 
  server_name: string;
  server_alias: string;
  server_note: string;
  server_url: string;
  backup_name: string;
  last_backup_date: string;
  last_elapsed: string;
  expected_date: string;
  expected_elapsed: string;
  backup_interval: string;
  overdue_tolerance: string; // Human-readable tolerance label
}

async function getNotificationConfig(): Promise<{
  ntfy: { url: string; topic: string; accessToken?: string };
  templates: { 
    language: SupportedTemplateLanguage;
    success: NotificationTemplate; 
    warning: NotificationTemplate; 
    overdueBackup: NotificationTemplate 
  };
  backupSettings: Record<BackupKey, import('./types').BackupNotificationConfig>;
} | null> {
  try {
    const backupSettings = await getConfigBackupSettings();
    
    // Get ntfy config with default topic generation if needed
    const ntfyConfig = await getNtfyConfig();
    const templates = getNotificationTemplates();
    
    return {
      ntfy: ntfyConfig,
      templates,
      backupSettings: Object.keys(backupSettings).length > 0 ? backupSettings : {}
    };
  } catch (error) {
    console.error('Failed to get notification config:', error instanceof Error ? error.message : String(error));
    return null;
  }
}


// Helper function to get backup settings with fallback to server settings
async function getBackupSettings(config: { backupSettings: Record<BackupKey, import('./types').BackupNotificationConfig> }, serverId: string, backupName: string) {
  const backupKey: BackupKey = `${serverId}:${backupName}`;
  const serverDefaultKey: BackupKey = `${serverId}:__default__`;
  
  const backupConfig = config.backupSettings?.[backupKey];
  const serverDefaults = config.backupSettings?.[serverDefaultKey];
  
  // If no backup config exists, return null (backup not configured)
  if (!backupConfig) {
    return null;
  }
  
  // Merge server defaults with backup overrides
  // Start with backup config as base
  const mergedConfig = { ...backupConfig };
  
  // Merge additional destinations with inheritance rules
  if (serverDefaults) {
    // For additionalNotificationEvent: use backup value if explicitly set, otherwise server default, otherwise fall back to notificationEvent
    if (!('additionalNotificationEvent' in backupConfig) || backupConfig.additionalNotificationEvent === undefined) {
      if (serverDefaults.additionalNotificationEvent !== undefined) {
        mergedConfig.additionalNotificationEvent = serverDefaults.additionalNotificationEvent;
      } else {
        // Fall back to notificationEvent if neither backup nor server default is set
        mergedConfig.additionalNotificationEvent = backupConfig.notificationEvent;
      }
    }
    
    // For additionalEmails: use backup value if field exists (even if empty), otherwise use server default
    if (!('additionalEmails' in backupConfig) || backupConfig.additionalEmails === undefined) {
      if (serverDefaults.additionalEmails !== undefined) {
        mergedConfig.additionalEmails = serverDefaults.additionalEmails;
      }
    }
    
    // For additionalNtfyTopic: use backup value if field exists (even if empty), otherwise use server default
    if (!('additionalNtfyTopic' in backupConfig) || backupConfig.additionalNtfyTopic === undefined) {
      if (serverDefaults.additionalNtfyTopic !== undefined) {
        mergedConfig.additionalNtfyTopic = serverDefaults.additionalNtfyTopic;
      }
    }
  } else {
    // No server defaults, ensure additionalNotificationEvent falls back to notificationEvent if not set
    if (!('additionalNotificationEvent' in backupConfig) || backupConfig.additionalNotificationEvent === undefined) {
      mergedConfig.additionalNotificationEvent = backupConfig.notificationEvent;
    }
  }
  
  return mergedConfig;
}


// Helper function to determine if an error is a network error that should be retried
function isRetryableNetworkError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for common network errors that are worth retrying
  return (
    errorMessage.includes('ENOTFOUND') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('ECONNRESET') ||
    errorMessage.includes('ENETUNREACH') ||
    errorMessage.includes('EHOSTUNREACH') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network error')
  );
}

// Helper function to sleep for a specified number of milliseconds
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract warning/error log text for notification templates.
// Prefer Warnings/Errors arrays; when those are empty (common with Duplicati HTTP reports),
// filter Messages/LogLines to Warning/Error/Fatal lines only — never dump Information noise.
export function extractLogText(backup: Backup, options?: ExtractLogTextOptions): string {
  try {
    const warnings = parseJsonStringArray(backup.warnings_array);
    const errors = parseJsonStringArray(backup.errors_array);
    let combined = [...warnings, ...errors];

    if (combined.length === 0) {
      const messages = parseJsonStringArray(backup.messages_array);
      // LogLines embed stack traces after the first line; keep the log line only.
      combined = messages
        .filter(isWarningOrErrorLogLine)
        .map((line) => line.split(/\r?\n/)[0]?.trim() ?? '')
        .filter((line) => line.length > 0);
    }

    const compact = options?.compact === true;
    const maxEntries = options?.maxEntries ?? (compact ? DEFAULT_NTFY_LOG_MAX_ENTRIES : undefined);
    const maxEntryLength = options?.maxEntryLength ?? DEFAULT_NTFY_LOG_ENTRY_LENGTH;

    if (typeof maxEntries === 'number' && maxEntries > 0 && combined.length > maxEntries) {
      const omitted = combined.length - maxEntries;
      combined = combined.slice(0, maxEntries);
      if (compact) {
        combined.push(`…and ${omitted} more`);
      }
    }

    if (compact) {
      return combined
        .map((entry) => summarizeLogEntryForNtfy(entry, maxEntryLength))
        .filter((entry) => entry.length > 0)
        .join('\n');
    }

    return combined.join('\n');
  } catch {
    return '';
  }
}

export async function sendNtfyNotification(
  ntfyUrl: string,
  topic: string,
  title: string,
  message: string,
  priority: string,
  tags: string,
  accessToken?: string,
  options?: { timeoutMs?: number; maxRetries?: number }
): Promise<void> {
  if (!ntfyUrl || !topic) {
    throw new Error('NTFY URL and topic are required');
  }

  // Build URL with parameters to handle Unicode characters properly
  const url = new URL(`${ntfyUrl.replace(/\/$/, '')}/${topic}`);
  
  // Add parameters to URL to avoid ByteString conversion issues with Unicode
  if (title && title.trim()) {
    url.searchParams.set('title', title);
  }
  
  if (priority && priority.trim()) {
    url.searchParams.set('priority', priority);
  }
  
  if (tags && tags.trim()) {
    url.searchParams.set('tags', tags);
  }

  // Ensure the message is properly encoded as UTF-8
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    Markdown: 'yes',
  };

  // Add authorization header if access token is provided
  if (accessToken && accessToken.trim()) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const maxRetries = options?.maxRetries ?? 5;
  const retryDelay = 3000; // 3 seconds
  const timeoutMs = options?.timeoutMs;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let response;
    try {
      response = await fetch(url.toString(), {
        method: 'POST',
        body: messageBytes,
        headers,
        ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Fetch failed for NTFY notification (attempt ${attempt}/${maxRetries}). Error: ${errorMessage}`);
      
      // If this is the last attempt or it's not a retryable network error, throw the error
      if (attempt === maxRetries || !isRetryableNetworkError(error)) {
        // Provide more specific error messages based on common failure patterns
        if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('DNS')) {
          throw new Error(`Failed to resolve NTFY server hostname. Please check your NTFY URL configuration.`);
        } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection refused')) {
          throw new Error(`Cannot connect to NTFY server. Please verify the server is running and accessible.`);
        } else if (errorMessage.includes('timeout')) {
          throw new Error(`Connection to NTFY server timed out. Please check your network connection and server status.`);
        } else if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
          throw new Error(`SSL/TLS certificate error when connecting to NTFY server. Please check your server certificate configuration.`);
        } else {
          throw new Error(`Network error when sending notification: ${errorMessage}`);
        }
      }
      
      // Wait before retrying (except on the last attempt)
      if (attempt < maxRetries) {
        console.log(`Retrying NTFY notification in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(retryDelay);
      }
      continue;
    }

    // If we get here, the fetch was successful
    if (!response.ok) {
      const errorBody = await response.text();
      let userFriendlyMessage = `Failed to send notification to NTFY: ${response.statusText}`;
      
      // Parse error response to provide user-friendly messages
      try {
        const errorData = JSON.parse(errorBody);
        if (errorData.code === 42901) {
          userFriendlyMessage = 'Notification service is temporarily unavailable due to rate limiting. Please try again later or upgrade your notification service plan.';
        } else if (errorData.error) {
          userFriendlyMessage = `Notification service error: ${errorData.error}`;
        }
      } catch {
        // If we can't parse the error body, use the original message
      }
      
      throw new Error(userFriendlyMessage);
    }
    
    // If we get here, the request was successful
    return;
  }
}

// Helper function to analyze SMTP errors and provide user-friendly messages
function analyzeSMTPError(
  errorMessage: string,
  connectionType: SMTPConnectionType,
  host: string,
  port: number
): {
  type: 'authentication' | 'ssl_version' | 'connection_type' | 'generic';
  userMessage: string;
} {
  const lowerError = errorMessage.toLowerCase();
  
  // Check for authentication errors first (highest priority)
  if (
    lowerError.includes('invalid login') ||
    lowerError.includes('badcredentials') ||
    lowerError.includes('535-5.7.8') ||
    lowerError.includes('username and password not accepted') ||
    lowerError.includes('authentication failed') ||
    lowerError.includes('invalid credentials') ||
    lowerError.includes('535')
  ) {
    return {
      type: 'authentication',
      userMessage: 'SMTP authentication failed. Please verify your username and password are correct.'
    };
  }
  
  // Check for SSL/TLS version errors
  if (
    lowerError.includes('wrong version number') ||
    lowerError.includes('tls_validate_record_header') ||
    lowerError.includes('ssl routines') ||
    lowerError.includes('tlsv1') ||
    lowerError.includes('protocol version')
  ) {
    return {
      type: 'ssl_version',
      userMessage: 'SSL/TLS version mismatch. The server may require a different TLS version or connection type. Try using "STARTTLS" if currently using "Direct SSL/TLS", or vice versa.'
    };
  }
  
  // Check for connection type errors (only when error actually indicates connection type issues)
  if (
    lowerError.includes('does not support starttls') ||
    lowerError.includes('starttls') && (lowerError.includes('not supported') || lowerError.includes('failed')) ||
    lowerError.includes('ehlo') && lowerError.includes('error') ||
    lowerError.includes('connection refused') ||
    lowerError.includes('econnrefused')
  ) {
    let userMessage = '';
    if (connectionType === 'plain') {
      userMessage = `Failed to connect to SMTP server at ${host}:${port} using Plain SMTP. ` +
        `Please verify the server address and port are correct.`;
    } else if (connectionType === 'starttls') {
      userMessage = `The SMTP server at ${host}:${port} does not support STARTTLS. ` +
        `Please change the connection type to "Plain SMTP" or use "Direct SSL/TLS" if your server supports it.`;
    } else if (connectionType === 'ssl') {
      userMessage = `Cannot establish SSL/TLS connection to ${host}:${port}. ` +
        `The server may not support direct SSL/TLS on this port. Try using "STARTTLS" or "Plain SMTP" instead, or use port 465 for SSL/TLS.`;
    } else {
      userMessage = `Failed to connect to SMTP server at ${host}:${port}.`;
    }
    return {
      type: 'connection_type',
      userMessage
    };
  }
  
  // Generic error fallback
  return {
    type: 'generic',
    userMessage: `Failed to connect to SMTP server at ${host}:${port}. Please verify your SMTP configuration.`
  };
}

// Email configuration functions
export async function createEmailTransporter(): Promise<Transporter | null> {
  try {
    const config = getSMTPConfig();
    if (!config) {
      return null;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If this is a master key error, log it and return null
    if (errorMessage.includes('MASTER_KEY_INVALID')) {
      console.error('Cannot create email transporter: Master key is invalid. SMTP settings must be reconfigured.');
      return null;
    }
    
    // Re-throw other errors
    throw error;
  }

  const config = getSMTPConfig()!; // We know it's not null from the check above

  try {
    // Determine connection type (default to STARTTLS if not set)
    const connectionType: SMTPConnectionType = config.connectionType || 'starttls';
    
    // Set secure based on connection type (true for ssl, false otherwise)
    const useSecure = connectionType === 'ssl';
    
    const transporterConfig: Record<string, unknown> = {
      host: config.host,
      port: config.port,
      secure: useSecure,
      // Connection timeout settings
      connectionTimeout: 45000,
      greetingTimeout: 45000,
      socketTimeout: 45000,
    };
    
    switch (connectionType) {
      case 'plain':
        // Never attempt TLS for plain SMTP connections
        transporterConfig.ignoreTLS = true;
        // Do not add any TLS configuration for plain connections
        break;
        
      case 'starttls':
        // Force STARTTLS upgrade and fail if server doesn't support it
        transporterConfig.requireTLS = true;
        // Add TLS configuration for STARTTLS
        transporterConfig.tls = {
          rejectUnauthorized: false, // Allow self-signed certificates
          minVersion: 'TLSv1.2', // Use modern TLS version
        };
        break;
        
      case 'ssl':
      default:
        // Add TLS configuration for direct SSL/TLS connections
        transporterConfig.tls = {
          rejectUnauthorized: false, // Allow self-signed certificates
          minVersion: 'TLSv1.2', // Use modern TLS version
        };
        break;
    }

    // Only include auth if authentication is required (defaults to true for backward compatibility)
    if (config.requireAuth !== false) {
      transporterConfig.auth = {
        user: config.username,
        pass: config.password,
      };
    }
    
    const transporter = nodemailer.createTransport(transporterConfig as TransportOptions);

    // Verify the connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      const errorMessage = verifyError instanceof Error ? verifyError.message : String(verifyError);
      
      // Analyze the error to provide accurate user-friendly messages
      const errorAnalysis = analyzeSMTPError(errorMessage, connectionType, config.host, config.port);
      
      // Append the original error message for debugging (only in development)
      const fullMessage = isDevelopmentMode()
        ? `${errorAnalysis.userMessage}\n\nOriginal error: ${errorMessage}`
        : errorAnalysis.userMessage;
      
      throw new Error(fullMessage);
    }
    
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function sendEmailNotification(
  subject: string,
  htmlContent: string,
  textContent: string,
  toEmail?: string
): Promise<void> {
  const transporter = await createEmailTransporter();
  if (!transporter) {
    throw new Error('Email is not configured. Please check environment variables.');
  }

  let config;
  try {
    config = getSMTPConfig();
    if (!config) {
      throw new Error('Email configuration not found');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If this is a master key error, provide a specific error message
    if (errorMessage.includes('MASTER_KEY_INVALID')) {
      throw new Error('Cannot send email: Master key is invalid. SMTP settings must be reconfigured.');
    }
    
    // Re-throw other errors
    throw error;
  }

  // Log the SMTP configuration being used for sending email (development only)
  if (isDevelopmentMode()) {
    console.log('[SMTP Config] Sending email with config:', {
      host: config.host,
      port: config.port,
      connectionType: config.connectionType || 'starttls',
      requireAuth: config.requireAuth !== false,
      username: config.username ? '***' : '(not set)',
      hasPassword: !!config.password,
      mailto: config.mailto,
      senderName: config.senderName,
      fromAddress: config.fromAddress || '(not set)'
    });
  }

  // Use configured sender name and from address, with fallback to current behavior
  const senderName = config.senderName || 'duplistatus';
  
  // Determine from address with proper fallback chain to ensure RFC 5322 compliance
  // Priority: fromAddress > username (mailto is no longer used as fallback)
  let fromAddress = config.fromAddress || config.username;
  
  // For plain connections, fromAddress is required (UI enforces this, but we validate here too)
  if (config.connectionType === 'plain') {
    if (!config.fromAddress || !config.fromAddress.trim() || !config.fromAddress.includes('@')) {
      throw new Error(
        'Invalid email configuration for Plain SMTP connection: From Address is required. ' +
        'Please configure a From Address in the email settings. Plain SMTP connections require ' +
        'a valid From Address to comply with RFC 5322 email standards.'
      );
    }
    fromAddress = config.fromAddress;
  }
  
  // Validate that fromAddress is not empty and contains '@' (basic email validation)
  if (!fromAddress || !fromAddress.trim() || !fromAddress.includes('@')) {
    throw new Error(
      'Invalid email configuration: From address is missing or invalid. ' +
      'Please configure either a From Address or SMTP Username in the email settings.'
    );
  }
  
  const recipientEmail = toEmail || config.mailto;
  
  const mailOptions = {
    from: `"${senderName}" <${fromAddress}>`,
    to: recipientEmail, // Use SMTP_MAILTO as default recipient
    subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const timestamp = new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' });
    console.log(`Email sent successfully to ${recipientEmail} at ${timestamp} (messageId: ${info.messageId})`);
  } catch (error) {
    console.error('Failed to send email:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to convert plain text to HTML
export function convertTextToHtml(text: string): string {
  return renderMarkdownEmail('duplistatus', text, {}).html;
}

function ntfyMessageForSend(ntfyMessage: string): string {
  return truncateNtfyAtLineBoundary(
    ntfyMessage,
    NTFY_MESSAGE_MAX_BYTES,
    '… (message truncated)'
  );
}

async function processTemplate(
  template: NotificationTemplate,
  context: NotificationContext | OverdueBackupContext,
  locale: string = SOURCE_LOCALE
): Promise<{
  title: string;
  message: string;
  ntfyMessage: string;
  emailHtml: string;
  emailText: string;
  priority: string;
  tags: string;
}> {
  const i18n = await getServerI18nForLanguage(locale);

  const formattedContext = { ...context } as Record<string, unknown>;

  const serverInfo = getServerInfoById(context.server_id);
  formattedContext.server_url = serverInfo?.server_url || '';
  formattedContext.server_alias = serverInfo?.alias
    ? `${serverInfo.alias} (${context.server_name})`
    : context.server_name;
  formattedContext.server_note = serverInfo?.note || '';

  formattedContext.backup_interval_value = 'backup_interval' in context ? context.backup_interval : '';
  formattedContext.backup_interval_type = '';

  if ('backup_date' in formattedContext) {
    formattedContext.backup_date = formatDateTime(formattedContext.backup_date as string, locale);
  }
  if ('last_backup_date' in formattedContext) {
    formattedContext.last_backup_date = formatDateTime(formattedContext.last_backup_date as string, locale);
  }
  if ('expected_date' in formattedContext) {
    formattedContext.expected_date = formatDateTime(formattedContext.expected_date as string, locale);
  }

  const numericFields = ['messages_count', 'warnings_count', 'errors_count', 'file_count', 'available_versions'] as const;
  for (const field of numericFields) {
    if (formattedContext[field] !== undefined && formattedContext[field] !== null) {
      const value = Number(formattedContext[field]);
      if (!isNaN(value)) {
        formattedContext[field] = formatInteger(value, locale);
      }
    }
  }

  const bytesFields = ['file_size', 'uploaded_size', 'storage_size'] as const;
  for (const field of bytesFields) {
    if (formattedContext[field] !== undefined && formattedContext[field] !== null) {
      const value = Number(formattedContext[field]);
      if (!isNaN(value)) {
        formattedContext[field] = formatBytesLocale(value, locale);
      }
    }
  }

  if ('status' in formattedContext && formattedContext.status !== null) {
    formattedContext.status = i18n.t(String(formattedContext.status));
  }

  if ('overdue_tolerance' in formattedContext && formattedContext.overdue_tolerance !== null) {
    formattedContext.overdue_tolerance = i18n.t(String(formattedContext.overdue_tolerance));
  }

  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(formattedContext)) {
    values[key] = value === null || value === undefined ? '' : String(value);
  }
  if (typeof formattedContext.log_text === 'string' && formattedContext.log_text.length > 0) {
    values.log_list = htmlList(String(formattedContext.log_text).split('\n').filter((line) => line.length > 0));
  } else {
    values.log_list = '';
  }

  const rendered = renderMarkdownEmail(template.title, template.message, values);
  return {
    title: rendered.subject,
    message: rendered.text,
    ntfyMessage: renderMarkdownNtfyText(template.message, values),
    emailHtml: rendered.html,
    emailText: rendered.text,
    priority: template.priority,
    tags: template.tags,
  };
}

function rejectionMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/**
 * Wait for primary notification channels.
 * A partial delivery counts as success so notification frequency can be recorded.
 * Throws only when every channel failed.
 */
async function settlePrimaryNotificationChannels(
  notifications: Promise<void>[],
  deliveredTypes: readonly string[],
): Promise<string[]> {
  if (notifications.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(notifications);
  const failureMessages: string[] = [];
  let firstRejection: unknown;
  for (const result of results) {
    if (result.status === 'rejected') {
      if (firstRejection === undefined) {
        firstRejection = result.reason;
      }
      failureMessages.push(rejectionMessage(result.reason));
    }
  }

  if (deliveredTypes.length === 0 && failureMessages.length > 0) {
    throw firstRejection instanceof Error ? firstRejection : new Error(failureMessages[0]);
  }

  return failureMessages;
}

export async function sendBackupNotification(
  backup: Backup,
  serverId: string,
  serverName: string,
  context: NotificationContext
): Promise<NotificationDeliveryOutcome> {
  // Daily Summary suppresses only the global SMTP recipient; additional emails still send.
  const suppressDefaultEmail = isDailySummaryEnabled();

  const config = await getNotificationConfig();
  if (!config) {
    console.log('No notification configuration found, skipping notification');
    return 'skipped';
  }

  const backupConfig = await getBackupSettings(config, serverId, backup.name);
  if (!backupConfig) {
    console.log(`No backup configuration found for backup ${backup.name} on server ${serverName}, skipping`);
    return 'skipped';
  }

  const status = backup.status;
  const notificationConf = backupConfig.notificationEvent;
  const additionalNotificationEvent = backupConfig.additionalNotificationEvent ?? backupConfig.notificationEvent;

  // Check if standard notifications should be sent (independent of additional notifications)
  let shouldSendStandard = true;
  if (notificationConf === 'off') {
    shouldSendStandard = false;
  } else {
    switch(notificationConf) {
      case 'warnings': // send warnings and errors (all but success)
        if (status === 'Success') {
          shouldSendStandard = false;
        }
        break;
      case 'errors': // send errors (only errors and fatals and errors count > 0)
        if (status != 'Error' && status != 'Fatal' && backup.errors == 0) {
          shouldSendStandard = false;
        }
        break;
      default: // default is to send messages (all)
        break;
    }
  }

  // Check if additional notifications should be sent (independent of standard notifications)
  let shouldSendToAdditional = true;
  switch(additionalNotificationEvent) {
    case 'warnings':
      if (status === 'Success') {
        shouldSendToAdditional = false;
      }
      break;
    case 'errors':
      if (status !== 'Error' && status !== 'Fatal' && backup.errors === 0) {
        shouldSendToAdditional = false;
      }
      break;
    case 'off':
      shouldSendToAdditional = false;
      break;
    default:
      break;
  }

  // If neither standard nor additional notifications should be sent, return early
  if (!shouldSendStandard && !shouldSendToAdditional) {
    console.log(`No notifications needed for backup ${backup.name} on server ${serverName}, status: ${status}, standard: ${notificationConf}, additional: ${additionalNotificationEvent}`);
    return 'skipped';
  }

  // Determine which template to use based on backup status
  let template: NotificationTemplate;
  if (status === 'Success') {
    template = config.templates?.success || defaultNotificationTemplates.success;
  }
  else {
    template = config.templates?.warning || defaultNotificationTemplates.warning;
  }

  let processedTemplate: Awaited<ReturnType<typeof processTemplate>> | undefined;
  let ntfyProcessedTemplate: Awaited<ReturnType<typeof processTemplate>> | undefined;
  try {
    const locale = config.templates?.language || SOURCE_LOCALE;
    processedTemplate = await processTemplate(template, context, locale);

    const needsNtfy =
      (shouldSendStandard && backupConfig.ntfyEnabled !== false) ||
      (shouldSendToAdditional &&
        !!backupConfig.additionalNtfyTopic &&
        backupConfig.additionalNtfyTopic.trim() !== '' &&
        !!config.ntfy.url);

    if (needsNtfy) {
      const ntfyContext: NotificationContext = {
        ...context,
        log_text: extractLogText(backup, { compact: true }),
      };
      ntfyProcessedTemplate = await processTemplate(template, ntfyContext, locale);
      ntfyProcessedTemplate = {
        ...ntfyProcessedTemplate,
        ntfyMessage: ntfyMessageForSend(ntfyProcessedTemplate.ntfyMessage),
      };
    }
  } catch (error) {
    console.error(`Failed to process notification template for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }

  // Send standard notifications if needed
  const standardNotificationTypes: string[] = [];
  if (shouldSendStandard) {
    const notifications: Promise<void>[] = [];

    // Send NTFY notification if enabled
    if (backupConfig.ntfyEnabled !== false && ntfyProcessedTemplate) { // Default to true if not specified
      notifications.push(
        sendNtfyNotification(
          config.ntfy.url,
          config.ntfy.topic,
          ntfyProcessedTemplate.title,
          ntfyProcessedTemplate.ntfyMessage,
          ntfyProcessedTemplate.priority,
          ntfyProcessedTemplate.tags,
          config.ntfy.accessToken
        ).then(async () => {
          standardNotificationTypes.push('NTFY');
          // Log audit event for successful NTFY notification
          const { AuditLogger } = await import('@/lib/audit-logger');
          await AuditLogger.logSystem(
            'notification_sent',
            {
              type: 'backup',
              channel: 'NTFY',
              serverId,
              serverName,
              backupName: backup.name,
              backupStatus: status,
              url: config.ntfy.url,
              topic: config.ntfy.topic,
            },
            'success'
          );
        }).catch(async (error) => {
          console.error(`Failed to send NTFY notification for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
          // Log audit event for failed NTFY notification
          try {
            const { AuditLogger } = await import('@/lib/audit-logger');
            await AuditLogger.logSystem(
              'notification_failed',
              {
                type: 'backup',
                channel: 'NTFY',
                serverId,
                serverName,
                backupName: backup.name,
                backupStatus: status,
                url: config.ntfy.url,
                topic: config.ntfy.topic,
                error: error instanceof Error ? error.message : String(error),
              },
              'error',
              error instanceof Error ? error.message : String(error)
            );
          } catch (auditError) {
            console.error(`Failed to log NTFY failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
          }
          throw new Error(`NTFY notification failed: ${error instanceof Error ? error.message : String(error)}`);
        })
      );
    }

    // Send email notification if enabled and configured
    if (!suppressDefaultEmail && backupConfig.emailEnabled === true && getSMTPConfig()) {
      const htmlContent = processedTemplate.emailHtml;
      const smtpConfig = getSMTPConfig();
      notifications.push(
        sendEmailNotification(
          processedTemplate.title,
          htmlContent,
          processedTemplate.message
        ).then(async () => {
          standardNotificationTypes.push('Email');
          // Log audit event for successful email notification
          if (smtpConfig) {
            const { AuditLogger } = await import('@/lib/audit-logger');
            const connectionType = smtpConfig.connectionType || 'starttls';
            const useSecure = connectionType === 'ssl';
            const requireTLS = connectionType === 'starttls';
            const ignoreTLS = connectionType === 'plain';
            await AuditLogger.logSystem(
              'email_sent',
              {
                type: 'backup',
                channel: 'Email',
                serverId,
                serverName,
                backupName: backup.name,
                backupStatus: status,
                host: smtpConfig.host,
                port: smtpConfig.port,
                connectionType: connectionType,
                secure: useSecure,
                requireTLS: requireTLS,
                ignoreTLS: ignoreTLS,
                requireAuth: smtpConfig.requireAuth !== false,
              },
              'success'
            );
          }
        }).catch(async (error) => {
          console.error(`Failed to send email notification for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
          // Log audit event for failed email notification (connection or delivery failure)
          try {
            const { AuditLogger } = await import('@/lib/audit-logger');
            // Try to get SMTP config if not available, but don't fail if we can't
            let emailConfig = smtpConfig;
            if (!emailConfig) {
              try {
                emailConfig = getSMTPConfig();
              } catch {
                // If we can't get config, we'll log with minimal info
              }
            }
            
            const auditDetails: Record<string, unknown> = {
              type: 'backup',
              channel: 'Email',
              serverId,
              serverName,
              backupName: backup.name,
              backupStatus: status,
              error: error instanceof Error ? error.message : String(error),
            };
            
            if (emailConfig) {
              const connectionType = emailConfig.connectionType || 'starttls';
              const useSecure = connectionType === 'ssl';
              const requireTLS = connectionType === 'starttls';
              const ignoreTLS = connectionType === 'plain';
              auditDetails.host = emailConfig.host;
              auditDetails.port = emailConfig.port;
              auditDetails.connectionType = connectionType;
              auditDetails.secure = useSecure;
              auditDetails.requireTLS = requireTLS;
              auditDetails.ignoreTLS = ignoreTLS;
              auditDetails.requireAuth = emailConfig.requireAuth !== false;
            }
            
            await AuditLogger.logSystem(
              'email_failed',
              auditDetails,
              'error',
              error instanceof Error ? error.message : String(error)
            );
          } catch (auditError) {
            console.error(`Failed to log email failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
          }
          throw new Error(`Email notification failed: ${error instanceof Error ? error.message : String(error)}`);
        })
      );
    }

    // A delivered channel counts even when another primary channel fails, so a later
    // frequency window can be recorded and additional destinations still run.
    if (notifications.length > 0) {
      const failureMessages = await settlePrimaryNotificationChannels(notifications, standardNotificationTypes);
      if (standardNotificationTypes.length > 0) {
        console.log(`Standard notifications sent (${standardNotificationTypes.join(', ')}) for backup ${backup.name} on server ${serverName}, status: ${status}, notification config: ${notificationConf}`);
      }
      if (failureMessages.length > 0) {
        console.error(`Some standard notifications failed for backup ${backup.name} on server ${serverName}:`, failureMessages.join('; '));
      }
    } else {
      console.log(`No standard notification channels enabled for backup ${backup.name} on server ${serverName}, skipping`);
    }
  }

  // Send to additional destinations if configured and needed
  if (!shouldSendToAdditional) {
    if (standardNotificationTypes.length > 0) {
      return 'sent';
    }
    if (suppressDefaultEmail) {
      console.log(`Daily summary mode is enabled; suppressing default-recipient email for backup ${backup.name} on server ${serverName}`);
      return 'suppressed';
    }
    return 'skipped';
  }

  const additionalNotifications: Promise<void>[] = [];
  const additionalNotificationTypes: string[] = [];

  // Send to additional email addresses if configured (not suppressed by Daily Summary)
  if (backupConfig.additionalEmails && backupConfig.additionalEmails.trim() && getSMTPConfig()) {
    const emailAddresses = backupConfig.additionalEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
    
    if (emailAddresses.length > 0) {
      const htmlContent = processedTemplate.emailHtml;
      for (const email of emailAddresses) {
        const smtpConfig = getSMTPConfig();
        additionalNotifications.push(
          sendEmailNotification(
            processedTemplate.title,
            htmlContent,
            processedTemplate.message,
            email
          ).then(async () => {
            if (!additionalNotificationTypes.includes('Additional Email')) {
              additionalNotificationTypes.push('Additional Email');
            }
            // Log audit event for successful additional email notification
            if (smtpConfig) {
              const { AuditLogger } = await import('@/lib/audit-logger');
              const connectionType = smtpConfig.connectionType || 'starttls';
              const useSecure = connectionType === 'ssl';
              const requireTLS = connectionType === 'starttls';
              const ignoreTLS = connectionType === 'plain';
              await AuditLogger.logSystem(
                'email_sent',
                {
                  type: 'backup',
                  channel: 'Additional Email',
                  serverId,
                  serverName,
                  backupName: backup.name,
                  backupStatus: status,
                  recipientEmail: email,
                  host: smtpConfig.host,
                  port: smtpConfig.port,
                  connectionType: connectionType,
                  secure: useSecure,
                  requireTLS: requireTLS,
                  ignoreTLS: ignoreTLS,
                  requireAuth: smtpConfig.requireAuth !== false,
                },
                'success'
              );
            }
          }).catch(async (error) => {
            console.error(`Failed to send additional email notification to ${email} for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
            // Log audit event for failed additional email notification (connection or delivery failure)
            try {
              const { AuditLogger } = await import('@/lib/audit-logger');
              // Try to get SMTP config if not available, but don't fail if we can't
              let emailConfig = smtpConfig;
              if (!emailConfig) {
                try {
                  emailConfig = getSMTPConfig();
                } catch {
                  // If we can't get config, we'll log with minimal info
                }
              }
              
              const auditDetails: Record<string, unknown> = {
                type: 'backup',
                channel: 'Additional Email',
                serverId,
                serverName,
                backupName: backup.name,
                backupStatus: status,
                recipientEmail: email,
                error: error instanceof Error ? error.message : String(error),
              };
              
              if (emailConfig) {
                const connectionType = emailConfig.connectionType || 'starttls';
                const useSecure = connectionType === 'ssl';
                const requireTLS = connectionType === 'starttls';
                const ignoreTLS = connectionType === 'plain';
                auditDetails.host = emailConfig.host;
                auditDetails.port = emailConfig.port;
                auditDetails.connectionType = connectionType;
                auditDetails.secure = useSecure;
                auditDetails.requireTLS = requireTLS;
                auditDetails.ignoreTLS = ignoreTLS;
                auditDetails.requireAuth = emailConfig.requireAuth !== false;
              }
              
              await AuditLogger.logSystem(
                'email_failed',
                auditDetails,
                'error',
                error instanceof Error ? error.message : String(error)
              );
            } catch (auditError) {
              console.error(`Failed to log email failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
            }
            // Don't throw - additional destinations are supplementary
          })
        );
      }
    }
  }

  // Send to additional NTFY topic if configured
  if (backupConfig.additionalNtfyTopic && backupConfig.additionalNtfyTopic.trim() && config.ntfy.url && ntfyProcessedTemplate) {
    const additionalTopic = backupConfig.additionalNtfyTopic.trim();
    additionalNotifications.push(
      sendNtfyNotification(
        config.ntfy.url,
        additionalTopic,
        ntfyProcessedTemplate.title,
        ntfyProcessedTemplate.ntfyMessage,
        ntfyProcessedTemplate.priority,
        ntfyProcessedTemplate.tags,
        config.ntfy.accessToken
      ).then(async () => {
        additionalNotificationTypes.push('Additional NTFY');
        // Log audit event for successful additional NTFY notification
        const { AuditLogger } = await import('@/lib/audit-logger');
        await AuditLogger.logSystem(
          'notification_sent',
          {
            type: 'backup',
            channel: 'Additional NTFY',
            serverId,
            serverName,
            backupName: backup.name,
            backupStatus: status,
            url: config.ntfy.url,
            topic: additionalTopic,
          },
          'success'
        );
      }).catch(async (error) => {
        console.error(`Failed to send additional NTFY notification to topic ${additionalTopic} for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
        // Log audit event for failed additional NTFY notification
        try {
          const { AuditLogger } = await import('@/lib/audit-logger');
          await AuditLogger.logSystem(
            'notification_failed',
            {
              type: 'backup',
              channel: 'Additional NTFY',
              serverId,
              serverName,
              backupName: backup.name,
              backupStatus: status,
              url: config.ntfy.url,
              topic: additionalTopic,
              error: error instanceof Error ? error.message : String(error),
            },
            'error',
            error instanceof Error ? error.message : String(error)
          );
        } catch (auditError) {
          console.error(`Failed to log NTFY failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
        }
        // Don't throw - additional destinations are supplementary
      })
    );
  }

  // Wait for additional notifications to complete (errors are logged but don't fail the function)
  if (additionalNotifications.length > 0) {
    try {
      await Promise.all(additionalNotifications);
      if (additionalNotificationTypes.length > 0) {
        console.log(`Additional notifications sent (${additionalNotificationTypes.join(', ')}) for backup ${backup.name} on server ${serverName}`);
      }
    } catch (error) {
      // Log but don't throw - additional destinations are supplementary
      console.error(`Some additional notifications failed for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
    }
  }

  const anyChannelSent =
    standardNotificationTypes.length > 0
    || additionalNotificationTypes.length > 0;
  if (anyChannelSent) {
    return 'sent';
  }
  if (suppressDefaultEmail) {
    console.log(`Daily summary mode is enabled; suppressing default-recipient email for backup ${backup.name} on server ${serverName}`);
    return 'suppressed';
  }

  return 'skipped';
}

export async function sendOverdueBackupNotification(
  context: OverdueBackupContext
): Promise<NotificationDeliveryOutcome> {
  // Daily Summary suppresses only the global SMTP recipient; additional emails still send.
  const suppressDefaultEmail = isDailySummaryEnabled();

  const notificationConfig = await getNotificationConfig();
  
  if (!notificationConfig) {
    return 'skipped';
  }

  // Get backup settings for this specific backup
  const backupConfig = await getBackupSettings(notificationConfig, context.server_id, context.backup_name);
  if (!backupConfig) {
    console.log(`No backup configuration found for overdue backup ${context.backup_name} on server ${context.server_name}, skipping`);
    return 'skipped';
  }

  const notificationTypes: string[] = [];
  const additionalNotificationTypes: string[] = [];

  try {
    const locale = notificationConfig.templates?.language || SOURCE_LOCALE;
    const processedTemplate = await processTemplate(notificationConfig.templates?.overdueBackup || defaultNotificationTemplates.overdueBackup, context, locale);
    const overdueNtfyMessage = ntfyMessageForSend(processedTemplate.ntfyMessage);
    
    // Send notifications based on backup configuration
    const notifications: Promise<void>[] = [];

    // Send NTFY notification if enabled
    if (backupConfig.ntfyEnabled !== false) { // Default to true if not specified
      notifications.push(
        sendNtfyNotification(
          notificationConfig.ntfy.url,
          notificationConfig.ntfy.topic,
          processedTemplate.title,
          overdueNtfyMessage,
          processedTemplate.priority,
          processedTemplate.tags,
          notificationConfig.ntfy.accessToken
        ).then(async () => {
          notificationTypes.push('NTFY');
          // Log audit event for successful NTFY notification
          const { AuditLogger } = await import('@/lib/audit-logger');
          await AuditLogger.logSystem(
            'notification_sent',
            {
              type: 'overdue',
              channel: 'NTFY',
              serverId: context.server_id,
              serverName: context.server_name,
              backupName: context.backup_name,
              url: notificationConfig.ntfy.url,
              topic: notificationConfig.ntfy.topic,
            },
            'success'
          );
        }).catch(async (error) => {
          console.error(`Failed to send NTFY overdue notification for ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
          // Log audit event for failed NTFY notification
          try {
            const { AuditLogger } = await import('@/lib/audit-logger');
            await AuditLogger.logSystem(
              'notification_failed',
              {
                type: 'overdue',
                channel: 'NTFY',
                serverId: context.server_id,
                serverName: context.server_name,
                backupName: context.backup_name,
                url: notificationConfig.ntfy.url,
                topic: notificationConfig.ntfy.topic,
                error: error instanceof Error ? error.message : String(error),
              },
              'error',
              error instanceof Error ? error.message : String(error)
            );
          } catch (auditError) {
            console.error(`Failed to log NTFY failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
          }
          throw new Error(`NTFY notification failed: ${error instanceof Error ? error.message : String(error)}`);
        })
      );
    }

    // Send email notification if enabled and configured
    if (!suppressDefaultEmail && backupConfig.emailEnabled === true && getSMTPConfig()) {
      const htmlContent = processedTemplate.emailHtml;
      const smtpConfig = getSMTPConfig();
      notifications.push(
        sendEmailNotification(
          processedTemplate.title,
          htmlContent,
          processedTemplate.message
        ).then(async () => {
          notificationTypes.push('Email');
          // Log audit event for successful email notification
          if (smtpConfig) {
            const { AuditLogger } = await import('@/lib/audit-logger');
            const connectionType = smtpConfig.connectionType || 'starttls';
            const useSecure = connectionType === 'ssl';
            const requireTLS = connectionType === 'starttls';
            const ignoreTLS = connectionType === 'plain';
            await AuditLogger.logSystem(
              'email_sent',
              {
                type: 'overdue',
                channel: 'Email',
                serverId: context.server_id,
                serverName: context.server_name,
                backupName: context.backup_name,
                host: smtpConfig.host,
                port: smtpConfig.port,
                connectionType: connectionType,
                secure: useSecure,
                requireTLS: requireTLS,
                ignoreTLS: ignoreTLS,
                requireAuth: smtpConfig.requireAuth !== false,
              },
              'success'
            );
          }
        }).catch(async (error) => {
          console.error(`Failed to send email overdue notification for ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
          // Log audit event for failed email notification (connection or delivery failure)
          try {
            const { AuditLogger } = await import('@/lib/audit-logger');
            // Try to get SMTP config if not available, but don't fail if we can't
            let emailConfig = smtpConfig;
            if (!emailConfig) {
              try {
                emailConfig = getSMTPConfig();
              } catch {
                // If we can't get config, we'll log with minimal info
              }
            }
            
            const auditDetails: Record<string, unknown> = {
              type: 'overdue',
              channel: 'Email',
              serverId: context.server_id,
              serverName: context.server_name,
              backupName: context.backup_name,
              error: error instanceof Error ? error.message : String(error),
            };
            
            if (emailConfig) {
              const connectionType = emailConfig.connectionType || 'starttls';
              const useSecure = connectionType === 'ssl';
              const requireTLS = connectionType === 'starttls';
              const ignoreTLS = connectionType === 'plain';
              auditDetails.host = emailConfig.host;
              auditDetails.port = emailConfig.port;
              auditDetails.connectionType = connectionType;
              auditDetails.secure = useSecure;
              auditDetails.requireTLS = requireTLS;
              auditDetails.ignoreTLS = ignoreTLS;
              auditDetails.requireAuth = emailConfig.requireAuth !== false;
            }
            
            await AuditLogger.logSystem(
              'email_failed',
              auditDetails,
              'error',
              error instanceof Error ? error.message : String(error)
            );
          } catch (auditError) {
            console.error(`Failed to log email failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
          }
          throw new Error(`Email notification failed: ${error instanceof Error ? error.message : String(error)}`);
        })
      );
    }

    // A delivered channel counts even when another primary channel fails, so the
    // overdue frequency window is recorded instead of repeating every check.
    if (notifications.length > 0) {
      const failureMessages = await settlePrimaryNotificationChannels(notifications, notificationTypes);
      if (notificationTypes.length > 0) {
        console.log(`Overdue notifications sent (${notificationTypes.join(', ')}) for backup ${context.backup_name} on server ${context.server_name}`);
      }
      if (failureMessages.length > 0) {
        console.error(`Some overdue notifications failed for backup ${context.backup_name} on server ${context.server_name}:`, failureMessages.join('; '));
      }
    } else {
      console.log(`No notification channels enabled for overdue backup ${context.backup_name} on server ${context.server_name}, skipping`);
    }

    // Send to additional destinations if configured.
    // Overdue is classified as a Warning for additional Notification Event filtering.
    const additionalNotificationEvent = backupConfig.additionalNotificationEvent ?? backupConfig.notificationEvent;
    let shouldSendToAdditional = false;
    switch (additionalNotificationEvent) {
      case 'all':
      case 'warnings':
        shouldSendToAdditional = true;
        break;
      case 'errors':
      case 'off':
        shouldSendToAdditional = false;
        break;
      default: {
        const _exhaustive: never = additionalNotificationEvent;
        void _exhaustive;
        shouldSendToAdditional = false;
        break;
      }
    }

    if (shouldSendToAdditional) {
      const additionalNotifications: Promise<void>[] = [];

      // Send to additional email addresses if configured (not suppressed by Daily Summary)
      if (backupConfig.additionalEmails && backupConfig.additionalEmails.trim() && getSMTPConfig()) {
        const emailAddresses = backupConfig.additionalEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0 && email.includes('@'));
        
        if (emailAddresses.length > 0) {
          const htmlContent = processedTemplate.emailHtml;
          for (const email of emailAddresses) {
            const smtpConfig = getSMTPConfig();
            additionalNotifications.push(
              sendEmailNotification(
                processedTemplate.title,
                htmlContent,
                processedTemplate.message,
                email
              ).then(async () => {
                if (!additionalNotificationTypes.includes('Additional Email')) {
                  additionalNotificationTypes.push('Additional Email');
                }
                // Log audit event for successful additional email notification
                if (smtpConfig) {
                  const { AuditLogger } = await import('@/lib/audit-logger');
                  const connectionType = smtpConfig.connectionType || 'starttls';
                  const useSecure = connectionType === 'ssl';
                  const requireTLS = connectionType === 'starttls';
                  const ignoreTLS = connectionType === 'plain';
                  await AuditLogger.logSystem(
                    'email_sent',
                    {
                      type: 'overdue',
                      channel: 'Additional Email',
                      serverId: context.server_id,
                      serverName: context.server_name,
                      backupName: context.backup_name,
                      recipientEmail: email,
                      host: smtpConfig.host,
                      port: smtpConfig.port,
                      connectionType: connectionType,
                      secure: useSecure,
                      requireTLS: requireTLS,
                      ignoreTLS: ignoreTLS,
                      requireAuth: smtpConfig.requireAuth !== false,
                    },
                    'success'
                  );
                }
              }).catch(async (error) => {
                console.error(`Failed to send additional email notification to ${email} for overdue backup ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
                // Log audit event for failed additional email notification (connection or delivery failure)
                try {
                  const { AuditLogger } = await import('@/lib/audit-logger');
                  // Try to get SMTP config if not available, but don't fail if we can't
                  let emailConfig = smtpConfig;
                  if (!emailConfig) {
                    try {
                      emailConfig = getSMTPConfig();
                    } catch {
                      // If we can't get config, we'll log with minimal info
                    }
                  }
                  
                  const auditDetails: Record<string, unknown> = {
                    type: 'overdue',
                    channel: 'Additional Email',
                    serverId: context.server_id,
                    serverName: context.server_name,
                    backupName: context.backup_name,
                    recipientEmail: email,
                    error: error instanceof Error ? error.message : String(error),
                  };
                  
                  if (emailConfig) {
                    const connectionType = emailConfig.connectionType || 'starttls';
                    const useSecure = connectionType === 'ssl';
                    const requireTLS = connectionType === 'starttls';
                    const ignoreTLS = connectionType === 'plain';
                    auditDetails.host = emailConfig.host;
                    auditDetails.port = emailConfig.port;
                    auditDetails.connectionType = connectionType;
                    auditDetails.secure = useSecure;
                    auditDetails.requireTLS = requireTLS;
                    auditDetails.ignoreTLS = ignoreTLS;
                    auditDetails.requireAuth = emailConfig.requireAuth !== false;
                  }
                  
                  await AuditLogger.logSystem(
                    'email_failed',
                    auditDetails,
                    'error',
                    error instanceof Error ? error.message : String(error)
                  );
                } catch (auditError) {
                  console.error(`Failed to log email failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
                }
                // Don't throw - additional destinations are supplementary
              })
            );
          }
        }
      }

      // Send to additional NTFY topic if configured
      if (backupConfig.additionalNtfyTopic && backupConfig.additionalNtfyTopic.trim() && notificationConfig.ntfy.url) {
        const additionalTopic = backupConfig.additionalNtfyTopic.trim();
        additionalNotifications.push(
          sendNtfyNotification(
            notificationConfig.ntfy.url,
            additionalTopic,
            processedTemplate.title,
            overdueNtfyMessage,
            processedTemplate.priority,
            processedTemplate.tags,
            notificationConfig.ntfy.accessToken
          ).then(async () => {
            additionalNotificationTypes.push('Additional NTFY');
            // Log audit event for successful additional NTFY notification
            const { AuditLogger } = await import('@/lib/audit-logger');
            await AuditLogger.logSystem(
              'notification_sent',
              {
                type: 'overdue',
                channel: 'Additional NTFY',
                serverId: context.server_id,
                serverName: context.server_name,
                backupName: context.backup_name,
                url: notificationConfig.ntfy.url,
                topic: additionalTopic,
              },
              'success'
            );
          }).catch(async (error) => {
            console.error(`Failed to send additional NTFY notification to topic ${additionalTopic} for overdue backup ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
            // Log audit event for failed additional NTFY notification
            try {
              const { AuditLogger } = await import('@/lib/audit-logger');
              await AuditLogger.logSystem(
                'notification_failed',
                {
                  type: 'overdue',
                  channel: 'Additional NTFY',
                  serverId: context.server_id,
                  serverName: context.server_name,
                  backupName: context.backup_name,
                  url: notificationConfig.ntfy.url,
                  topic: additionalTopic,
                  error: error instanceof Error ? error.message : String(error),
                },
                'error',
                error instanceof Error ? error.message : String(error)
              );
            } catch (auditError) {
              console.error(`Failed to log NTFY failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
            }
            // Don't throw - additional destinations are supplementary
          })
        );
      }

      // Wait for additional notifications to complete (errors are logged but don't fail the function)
      if (additionalNotifications.length > 0) {
        try {
          await Promise.all(additionalNotifications);
          if (additionalNotificationTypes.length > 0) {
            console.log(`Additional overdue notifications sent (${additionalNotificationTypes.join(', ')}) for backup ${context.backup_name} on server ${context.server_name}`);
          }
        } catch (error) {
          // Log but don't throw - additional destinations are supplementary
          console.error(`Some additional overdue notifications failed for backup ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
  } catch (error) {
    console.error(`Failed to send overdue backup notification for ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }

  const anyChannelSent =
    notificationTypes.length > 0
    || additionalNotificationTypes.length > 0;
  if (anyChannelSent) {
    return 'sent';
  }
  if (suppressDefaultEmail) {
    console.log(`Daily summary mode is enabled; suppressing default-recipient overdue email for backup ${context.backup_name} on server ${context.server_name}`);
    return 'suppressed';
  }

  return 'skipped';
}