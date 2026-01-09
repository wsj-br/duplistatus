import { withCSRF } from '@/lib/csrf-middleware';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationTemplate, NtfyConfig } from '@/lib/types';
import { sendEmailNotification, convertTextToHtml } from '@/lib/notifications';
import { getSMTPConfig, clearRequestCache } from '@/lib/db-utils';
import { optionalAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import { isDevelopmentMode } from '@/lib/utils';

async function sendNtfyNotificationDirect(config: NtfyConfig, message: string, title: string, priority: string, tags: string) {
  const { url, topic, accessToken } = config;
  
  if (!url || !topic) {
    throw new Error('NTFY URL and topic are required');
  }

  // Build URL with parameters to handle Unicode characters properly (same approach as main function)
  const urlObj = new URL(`${url.replace(/\/$/, '')}/${topic}`);
  
  // Add parameters to URL to avoid ByteString conversion issues with Unicode
  if (title && title.trim()) {
    urlObj.searchParams.set('title', title);
  }
  
  if (priority && priority.trim()) {
    urlObj.searchParams.set('priority', priority);
  }
  
  if (tags && tags.trim()) {
    urlObj.searchParams.set('tags', tags);
  }

  // Ensure the message is properly encoded as UTF-8 (same approach as main function)
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
  };

  // Add authorization header if access token is provided
  if (accessToken && accessToken.trim()) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(urlObj.toString(), {
    method: 'POST',
    body: messageBytes,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send notification to NTFY: ${response.statusText} - ${errorBody}`);
  }
}

export const POST = withCSRF(optionalAuth(async (request: NextRequest, authContext) => {
  let testType: 'simple' | 'template' | 'email' | 'unknown' = 'unknown';
  
  try {
    
    const { type, ntfyConfig, template, toEmail }: { 
      type: 'simple' | 'template' | 'email'; 
      ntfyConfig?: NtfyConfig; 
      template?: NotificationTemplate;
      toEmail?: string;
    } = await request.json();
    
    testType = type;

    // Handle email test
    if (type === 'email') {
      // Clear request cache to ensure we get the latest SMTP configuration
      // This is important when the config is updated by external scripts
      clearRequestCache();
      if (isDevelopmentMode()) {
        console.log('[API Test Email] Cache cleared, reading fresh SMTP config from database');
      }
      
      const smtpConfig = getSMTPConfig();
      if (!smtpConfig) {
        return NextResponse.json({ error: 'Email is not configured. Please configure SMTP settings.' }, { status: 400 });
      }
      
      if (isDevelopmentMode()) {
        console.log('[API Test Email] Read SMTP config:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          connectionType: smtpConfig.connectionType || 'starttls',
          requireAuth: smtpConfig.requireAuth !== false
        });
      }

      const senderName = smtpConfig.senderName || 'duplistatus';
      const fromAddress = smtpConfig.fromAddress || smtpConfig.username;
      const recipientEmail = toEmail || smtpConfig.mailto;
      const requiresAuth = smtpConfig.requireAuth !== false; // Default to true for backward compatibility
      
      const testSubject = 'Test Email from duplistatus';
      // Determine connection type (default to STARTTLS for backward compatibility)
      const connectionType = smtpConfig.connectionType || 'starttls';
      const connectionSecurity = 
        connectionType === 'plain' ? 'Plain SMTP (no encryption)'
        : connectionType === 'ssl' ? 'Direct SSL/TLS connection'
        : 'STARTTLS';
      
      // Calculate connection settings (used for both test email and audit log)
      const useSecure = connectionType === 'ssl';
      const requireTLS = connectionType === 'starttls';
      const ignoreTLS = connectionType === 'plain';
      
      let testMessage = `This is a test email from duplistatus.

Email Configuration Details:
  SMTP Server: ${smtpConfig.host}
  SMTP Port: ${smtpConfig.port}
  Connection Type: ${connectionSecurity}
  Secure (Direct SSL/TLS): ${useSecure ? 'Yes' : 'No'}
  Require TLS (STARTTLS): ${requireTLS ? 'Yes' : 'No'}
  Ignore TLS (Plain SMTP): ${ignoreTLS ? 'Yes' : 'No'}
  SMTP Authentication Required: ${requiresAuth ? 'Yes' : 'No'}`;

      // Only show username if authentication is required
      if (requiresAuth) {
        testMessage += `\n  SMTP Server Username: ${smtpConfig.username}`;
      }

      testMessage += `
  Recipient Email (To:): ${recipientEmail}
  From Address: ${fromAddress}
  Sender Name: ${senderName}
  
  Test sent at: ${new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' })}
  `;
      const htmlContent = convertTextToHtml(testMessage);
      
      const ipAddress = authContext ? getClientIpAddress(request) : null;
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      try {
        await sendEmailNotification(testSubject, htmlContent, testMessage, recipientEmail);
        
        // Log audit event for successful email
        if (authContext) {
          await AuditLogger.log({
            userId: authContext.userId,
            username: authContext.username,
            action: 'test_email_sent',
            category: 'system',
            details: {
              type: 'email',
              channel: 'Email',
              host: smtpConfig.host,
              port: smtpConfig.port,
              connectionType: connectionType,
              secure: useSecure,
              requireTLS: requireTLS,
              ignoreTLS: ignoreTLS,
              requireAuth: requiresAuth,
            },
            ipAddress,
            userAgent,
            status: 'success',
          });
        }
      } catch (error) {
        // Log audit event for failed email (connection or delivery failure)
        if (authContext) {
          try {
            // Try to get SMTP config if not available, but don't fail if we can't
            let emailConfig: ReturnType<typeof getSMTPConfig> = smtpConfig;
            if (!emailConfig) {
              try {
                emailConfig = getSMTPConfig();
              } catch {
                // If we can't get config, we'll log with minimal info
              }
            }
            
            const auditDetails: Record<string, unknown> = {
              type: 'email',
              channel: 'Email',
              error: error instanceof Error ? error.message : String(error),
            };
            
            if (emailConfig) {
              const connType = emailConfig.connectionType || 'starttls';
              auditDetails.host = emailConfig.host;
              auditDetails.port = emailConfig.port;
              auditDetails.connectionType = connType;
              auditDetails.secure = connType === 'ssl';
              auditDetails.requireTLS = connType === 'starttls';
              auditDetails.ignoreTLS = connType === 'plain';
              auditDetails.requireAuth = emailConfig.requireAuth !== false;
            } else if (smtpConfig) {
              // Fallback to original values if available
              auditDetails.host = smtpConfig.host;
              auditDetails.port = smtpConfig.port;
              auditDetails.connectionType = connectionType;
              auditDetails.secure = useSecure;
              auditDetails.requireTLS = requireTLS;
              auditDetails.ignoreTLS = ignoreTLS;
              auditDetails.requireAuth = requiresAuth;
            }
            
            await AuditLogger.log({
              userId: authContext.userId,
              username: authContext.username,
              action: 'test_email_sent',
              category: 'system',
              details: auditDetails,
              ipAddress,
              userAgent,
              status: 'error',
              errorMessage: error instanceof Error ? error.message : String(error),
            });
          } catch (auditError) {
            console.error(`Failed to log email failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
          }
        }
        throw error;
      }
      
      return NextResponse.json({ message: 'Test email sent successfully' });
    }

    // NTFY validation for non-email tests
    if (!ntfyConfig) {
      return NextResponse.json({ error: 'NTFY configuration is required' }, { status: 400 });
    }

    if (!ntfyConfig.url || !ntfyConfig.topic) {
      return NextResponse.json({ error: 'NTFY URL and topic are required' }, { status: 400 });
    }

    if (type === 'template') {
      if (!template) {
        return NextResponse.json({ error: 'Template is required for template type' }, { status: 400 });
      }

      // Create sample data for testing
      const sampleData = {
        server_name: 'server_name',
        server_alias: 'server_alias',
        server_note: 'server_note',
        server_url: 'server_url',
        backup_name: 'backup_name',
        backup_date: 'backup_date',
        status: 'status',
        messages_count: 'messages_count',
        warnings_count: 'warnings_count',
        errors_count: 'errors_count',
        duration: 'duration',
        file_count: 'file_count',
        file_size: 'file_size',
        uploaded_size: 'uploaded_size',
        storage_size: 'storage_size',
        available_versions: 'available_versions',
        log_text: 'Sample warning 1\nSample error 1\nSample message 1',
      };

      // Process the template with sample data
      const processedTitle = template.title?.replace(/\{(\w+)\}/g, (match, key) => {
        return sampleData[key as keyof typeof sampleData] || match;
      }) || 'Test Notification';

      const processedMessage = template.message?.replace(/\{(\w+)\}/g, (match, key) => {
        return sampleData[key as keyof typeof sampleData] || match;
      }) || 'Test message';

      const testTimestamp = new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' });
      const finalMessage = processedMessage + '\n(test sent at ' + testTimestamp + ')';

      // Send notifications to both NTFY and email (if configured)
      const notifications: Promise<void>[] = [];
      const notificationTypes: string[] = [];
      const ipAddress = authContext ? getClientIpAddress(request) : null;
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Send NTFY notification
      notifications.push(
        sendNtfyNotificationDirect(
          ntfyConfig,
          finalMessage,
          processedTitle,
          template.priority || 'default',
          template.tags || ''
        ).then(async () => {
          notificationTypes.push('NTFY');
          // Log audit event for successful NTFY notification
          if (authContext) {
            await AuditLogger.log({
              userId: authContext.userId,
              username: authContext.username,
              action: 'test_notification_sent',
              category: 'system',
              details: {
                type: 'template',
                channel: 'NTFY',
                templateType: template ? 'custom' : 'default',
                url: ntfyConfig.url,
                topic: ntfyConfig.topic,
              },
              ipAddress,
              userAgent,
              status: 'success',
            });
          }
        }).catch(async (error) => {
          console.error('NTFY test notification failed:', error);
          // Log audit event for failed NTFY notification
          if (authContext) {
            try {
              await AuditLogger.log({
                userId: authContext.userId,
                username: authContext.username,
                action: 'test_notification_sent',
                category: 'system',
                details: {
                  type: 'template',
                  channel: 'NTFY',
                  templateType: template ? 'custom' : 'default',
                  url: ntfyConfig.url,
                  topic: ntfyConfig.topic,
                },
                ipAddress,
                userAgent,
                status: 'error',
                errorMessage: error instanceof Error ? error.message : String(error),
              });
            } catch (auditError) {
              console.error(`Failed to log NTFY failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
            }
          }
          throw new Error(`NTFY test failed: ${error instanceof Error ? error.message : String(error)}`);
        })
      );

      // Send email notification if configured
      if (getSMTPConfig()) {
        const htmlContent = convertTextToHtml(finalMessage);
        const smtpConfig = getSMTPConfig();
        notifications.push(
          sendEmailNotification(
            processedTitle,
            htmlContent,
            finalMessage
          ).then(async () => {
            notificationTypes.push('Email');
            // Log audit event for successful email notification
            if (authContext && smtpConfig) {
              const connectionType = smtpConfig.connectionType || 'starttls';
              const useSecure = connectionType === 'ssl';
              const requireTLS = connectionType === 'starttls';
              const ignoreTLS = connectionType === 'plain';
              await AuditLogger.log({
                userId: authContext.userId,
                username: authContext.username,
                action: 'test_email_sent',
                category: 'system',
                details: {
                  type: 'template',
                  channel: 'Email',
                  templateType: template ? 'custom' : 'default',
                  host: smtpConfig.host,
                  port: smtpConfig.port,
                  connectionType: connectionType,
                  secure: useSecure,
                  requireTLS: requireTLS,
                  ignoreTLS: ignoreTLS,
                  requireAuth: smtpConfig.requireAuth !== false,
                },
                ipAddress,
                userAgent,
                status: 'success',
              });
            }
          }).catch(async (error) => {
            console.error('Email test notification failed:', error);
            // Log audit event for failed email notification (connection or delivery failure)
            if (authContext) {
              try {
                // Try to get SMTP config if not available, but don't fail if we can't
                let emailConfig: ReturnType<typeof getSMTPConfig> = smtpConfig;
                if (!emailConfig) {
                  try {
                    emailConfig = getSMTPConfig();
                  } catch {
                    // If we can't get config, we'll log with minimal info
                  }
                }
                
                const auditDetails: Record<string, unknown> = {
                  type: 'template',
                  channel: 'Email',
                  templateType: template ? 'custom' : 'default',
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
                
                await AuditLogger.log({
                  userId: authContext.userId,
                  username: authContext.username,
                  action: 'test_email_sent',
                  category: 'system',
                  details: auditDetails,
                  ipAddress,
                  userAgent,
                  status: 'error',
                  errorMessage: error instanceof Error ? error.message : String(error),
                });
              } catch (auditError) {
                console.error(`Failed to log email failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
              }
            }
            throw new Error(`Email test failed: ${error instanceof Error ? error.message : String(error)}`);
          })
        );
      }

      // Wait for all notifications to complete
      await Promise.all(notifications);

      return NextResponse.json({ 
        success: true, 
        message: `Test notifications sent successfully via ${notificationTypes.join(' and ')}`,
        channels: notificationTypes 
      });
    } else {
      // Simple test notification
      const ipAddress = authContext ? getClientIpAddress(request) : null;
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      try {
        await sendNtfyNotificationDirect(
          ntfyConfig, 
          'This is a test notification from duplistatus.\n(test sent at ' + new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }) + ')', 
          'Test Notification', 
          'default', 
          'test'
        );
        
        // Log audit event for successful NTFY notification
        if (authContext) {
          await AuditLogger.log({
            userId: authContext.userId,
            username: authContext.username,
            action: 'test_notification_sent',
            category: 'system',
            details: {
              type: 'simple',
              channel: 'NTFY',
              url: ntfyConfig.url,
              topic: ntfyConfig.topic,
            },
            ipAddress,
            userAgent,
            status: 'success',
          });
        }
      } catch (error) {
        // Log audit event for failed NTFY notification
        if (authContext) {
          try {
            await AuditLogger.log({
              userId: authContext.userId,
              username: authContext.username,
              action: 'test_notification_sent',
              category: 'system',
              details: {
                type: 'simple',
                channel: 'NTFY',
                url: ntfyConfig.url,
                topic: ntfyConfig.topic,
              },
              ipAddress,
              userAgent,
              status: 'error',
              errorMessage: error instanceof Error ? error.message : String(error),
            });
          } catch (auditError) {
            console.error(`Failed to log NTFY failure to audit log:`, auditError instanceof Error ? auditError.message : String(auditError));
          }
        }
        throw error;
      }
      
      return NextResponse.json({ message: 'Test notification sent successfully' });
    }
  } catch (error) {
    console.error('Failed to send test notification:', error instanceof Error ? error.message : String(error));
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Log audit event for error
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      // If it's an email test, include connection details
      const auditDetails: Record<string, unknown> = {
        type: testType,
        error: errorMessage,
      };
      
      if (testType === 'email') {
        const smtpConfig = getSMTPConfig();
        if (smtpConfig) {
          const connectionType = smtpConfig.connectionType || 'starttls';
          const useSecure = connectionType === 'ssl';
          const requireTLS = connectionType === 'starttls';
          const ignoreTLS = connectionType === 'plain';
          
          auditDetails.host = smtpConfig.host;
          auditDetails.port = smtpConfig.port;
          auditDetails.connectionType = connectionType;
          auditDetails.secure = useSecure;
          auditDetails.requireTLS = requireTLS;
          auditDetails.ignoreTLS = ignoreTLS;
          auditDetails.requireAuth = smtpConfig.requireAuth !== false;
        }
      }
      
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
        action: testType === 'email' ? 'test_email_sent' : 'test_notification_sent',
        category: 'system',
        details: auditDetails,
        ipAddress,
        userAgent,
        status: 'error',
        errorMessage,
      });
    }
    
    return NextResponse.json({ error: `Failed to send test notification: ${errorMessage}` }, { status: 500 });
  }
}));