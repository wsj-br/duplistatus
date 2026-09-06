"use client";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ClipboardPaste, Send, RotateCcw, CheckCircle, AlertTriangle, Clock, Type, Star, Tag, MessageSquare, Info, CalendarClock, Eye } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { EmailHtmlPreviewIframe } from '@/components/settings/email-html-preview-iframe';
import { useToast } from '@/components/ui/use-toast';
import { NotificationTemplate, SUPPORTED_TEMPLATE_LANGUAGES, type SupportedTemplateLanguage, type DailySummaryEmailTemplate, type DailySummaryTemplateSet } from '@/lib/types';
import { getLocaleEnglishName, SOURCE_LOCALE } from '@/lib/locales';
import { defaultNotificationTemplates, getDefaultNotificationTemplate, getDefaultDailySummaryTemplates } from '@/lib/default-config';
import { getUserLocalStorageItem, setUserLocalStorageItem } from '@/lib/user-local-storage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';

type NotificationTemplatesTab = 'success' | 'warning' | 'overdue' | 'daily-summary';

function parseNotificationTemplatesTab(value: string | null): NotificationTemplatesTab | null {
  if (value === 'success' || value === 'warning' || value === 'overdue' || value === 'daily-summary') {
    return value;
  }
  return null;
}

const createTemplateVariables = (t: TFunction) => [
  { name: 'server_name', description: t("Name of the server") },
  { name: 'server_alias', description: t("Alias of the server (server_name if not set)") },
  { name: 'server_note', description: t("Note of the server") },
  { name: 'server_url', description: t("URL of the Duplicati server") },
  { name: 'backup_name', description: t("Name of the backup") },
  { name: 'backup_date', description: t("Date/time of the backup") },
  { name: 'status', description: t("Backup status (Success, Failed, etc.)") },
  { name: 'messages_count', description: t("Number of messages") },
  { name: 'warnings_count', description: t("Number of warnings") },
  { name: 'errors_count', description: t("Number of errors") },
  { name: 'log_text', description: t("Log text messages (warnings and errors)") },
  { name: 'duration', description: t("Backup duration") },
  { name: 'file_count', description: t("Number of files processed") },
  { name: 'file_size', description: t("Total file size") },
  { name: 'uploaded_size', description: t("Size of uploaded data") },
  { name: 'storage_size', description: t("Storage size used") },
  { name: 'available_versions', description: t("Number of available versions") },
];

const createTemplateVariablesDailySummary = (t: TFunction) => [
  { name: 'summary_date', description: t("Local calendar date of the summary") },
  { name: 'generated_at', description: t("Time the snapshot was generated") },
  { name: 'time_zone', description: t("Saved IANA timezone") },
  { name: 'server_count', description: t("Number of servers with known jobs") },
  { name: 'job_count', description: t("Number of known backup jobs") },
  { name: 'success_count', description: t("Jobs whose latest result is Success") },
  { name: 'warning_count', description: t("Jobs whose latest result is Warning") },
  { name: 'error_count', description: t("Jobs whose latest result is Error") },
  { name: 'fatal_count', description: t("Jobs whose latest result is Fatal") },
  { name: 'unknown_count', description: t("Jobs whose latest result is Unknown") },
  { name: 'no_report_count', description: t("Configured jobs with no report received") },
  { name: 'overdue_count', description: t("Jobs that are overdue") },
  { name: 'latest_uploaded_size', description: t("Sum of latest uploaded sizes") },
  { name: 'latest_source_size', description: t("Sum of latest source sizes") },
  { name: 'latest_storage_size', description: t("Sum of latest storage sizes") },
  { name: 'latest_file_count', description: t("Sum of latest examined files") },
  { name: 'total_warnings', description: t("Sum of latest warning counts") },
  { name: 'total_errors', description: t("Sum of latest error counts") },
  { name: 'problem_table', description: t("Table of jobs that need attention") },
  { name: 'all_jobs_table', description: t("Table of all latest backup results") },
  { name: 'duplistatus_link', description: t('Link to the duplistatus dashboard (empty when no public URL is configured)') },
  { name: 'duplistatus_url', description: t('Public URL of this duplistatus dashboard (empty when no public URL is configured)') },
];
const createTemplateVariablesOverdueBackup = (t: TFunction) => [
  { name: 'server_name', description: t("Name of the server") },
  { name: 'server_alias', description: t("Alias of the server (server_name if not set)") },
  { name: 'server_note', description: t("Note of the server") },
  { name: 'server_url', description: t("URL of the Duplicati server") },
  { name: 'backup_name', description: t("Name of the backup") },
  { name: 'last_backup_date', description: t("Date/time of the last backup") },
  { name: 'last_elapsed', description: t("Time ago since the last backup") },
  { name: 'expected_date', description: t("Date/time when the backup was expected") },
  { name: 'expected_elapsed', description: t("Time elapsed since the expected backup date") },
  { name: 'backup_interval', description: t("Backup interval string (e.g., \"1D\", \"2W\", \"1M\")") },
  { name: 'overdue_tolerance', description: t("Configured overdue tolerance (1 hour, 1 day, etc.)") },
];

interface NotificationTemplatesFormProps {
  templates?: {
    success?: NotificationTemplate;
    warning?: NotificationTemplate;
    overdueBackup?: NotificationTemplate;
    dailySummary?: DailySummaryTemplateSet;
  };
  onSave: (templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    overdueBackup: NotificationTemplate;
    dailySummary: DailySummaryTemplateSet;
  }) => void;
  onSendTest?: (template: NotificationTemplate) => Promise<void>;
}

// TemplateEditor component moved outside to prevent re-renders
const TemplateEditor = ({ 
  templateType, 
  template, 
  title, 
  description,
  selectedVariable,
  setSelectedVariable,
  insertVariable,
  updateTemplate,
  fieldRefs,
  onFieldFocus,
  activeTab,
  createRefCallback,
  t,
}: { 
  templateType: 'success' | 'warning' | 'overdueBackup';
  template: NotificationTemplate;
  title: string;
  description: string;
  selectedVariable: string;
  setSelectedVariable: (value: string) => void;
  insertVariable: (templateType: 'success' | 'warning' | 'overdueBackup') => void;
  updateTemplate: (
    templateType: 'success' | 'warning' | 'overdueBackup',
    field: keyof NotificationTemplate,
    value: string
  ) => void;
  fieldRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>;
  onFieldFocus: (field: keyof NotificationTemplate) => void;
  activeTab: 'success' | 'warning' | 'overdue' | 'daily-summary';
  createRefCallback: (key: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
  t: TFunction;
}) => {
  // Determine which variable list to use based on active tab
  const variablesList = useMemo(() => {
    return activeTab === 'overdue' 
      ? createTemplateVariablesOverdueBackup(t)
      : createTemplateVariables(t);
  }, [activeTab, t]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row justify-end-safe items-start sm:items-center gap-2">
            <Select value={selectedVariable} onValueChange={setSelectedVariable}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder={t("Select variable...")} />
              </SelectTrigger>
              <SelectContent>
                {variablesList.map((variable) => (
                  <SelectItem key={variable.name} value={variable.name}>
                    <div className="flex flex-col items-start w-full text-left">
                      <span className="font-mono">{'{' + variable.name + '}'}</span>
                      <span className="text-xs text-muted-foreground">{variable.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertVariable(templateType)}
              disabled={!selectedVariable}
              className="flex items-center gap-1 w-full sm:w-auto"
            >
              <ClipboardPaste className="h-4 w-4" />
              {t("Insert")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-title`} className="flex items-center gap-2">
              <ColoredIcon icon={Type} color="blue" size="sm" />
              {t("Title")}
            </Label>
            <Input
              id={`${templateType}-title`}
              value={template.title || ''}
              onChange={(e) => updateTemplate(templateType, 'title', e.target.value)}
              placeholder={t("Enter notification title")}
              ref={createRefCallback(`${templateType}-title`)}
              onFocus={() => onFieldFocus('title')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-priority`} className="flex items-center gap-2">
              <ColoredIcon icon={Star} color="yellow" size="sm" />
              {t("Priority")}
            </Label>
            <Select
              value={template.priority || 'default'}
              onValueChange={(value) => updateTemplate(templateType, 'priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="max">{t("Max/Urgent")}</SelectItem>
                <SelectItem value="high">{t("High")}</SelectItem>
                <SelectItem value="default">{t("Default")}</SelectItem>
                <SelectItem value="low">{t("Low")}</SelectItem>
                <SelectItem value="min">{t("Min")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-tags`} className="flex items-center gap-2">
              <ColoredIcon icon={Tag} color="green" size="sm" />
              {t("Tags (comma separated)")}
            </Label>
            <Input
              id={`${templateType}-tags`}
              value={template.tags || ''}
              onChange={(e) => updateTemplate(templateType, 'tags', e.target.value)}
              placeholder=""
              ref={createRefCallback(`${templateType}-tags`)}
              onFocus={() => onFieldFocus('tags')}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${templateType}-message`} className="flex items-center gap-2">
            <ColoredIcon icon={MessageSquare} color="purple" size="sm" />
            {t("Message Template")}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('Email body is Markdown. Headings, lists, links, and tables are supported. Titles, priority, and tags stay plain text.')}
          </p>
          <Textarea
            ref={createRefCallback(`${templateType}-message`)}
            id={`${templateType}-message`}
            value={template.message || ''}
            onChange={(e) => updateTemplate(templateType, 'message', e.target.value)}
            placeholder={t("Enter your message template using variables like {{server_name}}, {{backup_name}}, {{status}}, etc.")}
            className="min-h-[262px]"
            onFocus={() => onFieldFocus('message')}
          />
          <p className="text-sm text-muted-foreground">
            {t("Tip: to insert a variable, place your cursor where you want it, choose the variable, and click 'Insert'.")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

type DailySummaryField = keyof DailySummaryEmailTemplate;

const DailySummaryEmailEditor = ({
  template,
  title,
  description,
  selectedVariable,
  setSelectedVariable,
  insertVariable,
  updateTemplate,
  createRefCallback,
  onFieldFocus,
  t,
}: {
  template: DailySummaryEmailTemplate;
  title: string;
  description: string;
  selectedVariable: string;
  setSelectedVariable: (value: string) => void;
  insertVariable: () => void;
  updateTemplate: (field: DailySummaryField, value: string) => void;
  createRefCallback: (key: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
  onFieldFocus: (field: DailySummaryField) => void;
  t: TFunction;
}) => {
  const variablesList = useMemo(() => createTemplateVariablesDailySummary(t), [t]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row justify-end-safe items-start sm:items-center gap-2">
            <Select value={selectedVariable} onValueChange={setSelectedVariable}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder={t("Select variable...")} />
              </SelectTrigger>
              <SelectContent>
                {variablesList.map((variable) => (
                  <SelectItem key={variable.name} value={variable.name}>
                    <div className="flex flex-col items-start w-full text-left">
                      <span className="font-mono">{'{' + variable.name + '}'}</span>
                      <span className="text-xs text-muted-foreground">{variable.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={insertVariable}
              disabled={!selectedVariable}
              className="flex items-center gap-1 w-full sm:w-auto"
            >
              <ClipboardPaste className="h-4 w-4" />
              {t("Insert")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="daily-summary-title" className="flex items-center gap-2">
            <ColoredIcon icon={Type} color="blue" size="sm" />
            {t('Subject')}
          </Label>
          <Input
            id="daily-summary-title"
            value={template.title}
            onChange={(event) => updateTemplate('title', event.target.value)}
            placeholder={t('Enter email subject')}
            ref={createRefCallback('daily-summary-title')}
            onFocus={() => onFieldFocus('title')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="daily-summary-message" className="flex items-center gap-2">
            <ColoredIcon icon={MessageSquare} color="purple" size="sm" />
            {t('Email body (Markdown)')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('Email body is Markdown. Headings, lists, links, and tables are supported. Titles, priority, and tags stay plain text.')}
          </p>
          <Textarea
            ref={createRefCallback('daily-summary-message')}
            id="daily-summary-message"
            value={template.message}
            onChange={(event) => updateTemplate('message', event.target.value)}
            placeholder={t('Enter your daily summary email body using variables like {{summary_date}}, {{job_count}}, {{problem_table}}, etc.')}
            className="min-h-[262px]"
            onFocus={() => onFieldFocus('message')}
          />
          <p className="text-sm text-muted-foreground">
            {t("Tip: to insert a variable, place your cursor where you want it, choose the variable, and click 'Insert'.")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function NotificationTemplatesForm({ templates, onSave, onSendTest }: NotificationTemplatesFormProps) {
  const { t } = useTranslation();

  const templateLanguageName = (lang: SupportedTemplateLanguage) => {
    return t(getLocaleEnglishName(lang));
  };

  const notificationTemplateTitleForTab = (tab: "success" | "warning" | "overdue" | "daily-summary") => {
    switch (tab) {
      case "success":
        return t("Success Notification Template");
      case "warning":
        return t("Warning/Error Notification Template");
      case "overdue":
        return t("Overdue Backup Notification Template");
      case "daily-summary":
        return t("Daily Summary");
      default: {
        const exhaustive: never = tab;
        return exhaustive;
      }
    }
  };
  const { toast } = useToast();
  const currentUser = useCurrentUser();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState(() => {
    // Ensure we have default templates if the provided templates are incomplete
    return {
      success: templates?.success || defaultNotificationTemplates.success,
      warning: templates?.warning || defaultNotificationTemplates.warning,
      overdueBackup: templates?.overdueBackup || defaultNotificationTemplates.overdueBackup,
      dailySummary: templates?.dailySummary || defaultNotificationTemplates.dailySummary,
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewNtfy, setPreviewNtfy] = useState('');
  const [previewView, setPreviewView] = useState<'html' | 'text' | 'ntfy'>('html');
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [dailySummaryFocusedField, setDailySummaryFocusedField] = useState<DailySummaryField>('message');
  const [templateLanguage, setTemplateLanguage] = useState<SupportedTemplateLanguage>(SOURCE_LOCALE);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);
  const [isResetSingleDialogOpen, setIsResetSingleDialogOpen] = useState(false);
  const [isResetAllDialogOpen, setIsResetAllDialogOpen] = useState(false);
  const hasLoadedUserTabRef = useRef(false);
  
  // Initialize activeTab from localStorage or default to 'success'
  const [activeTab, setActiveTab] = useState<NotificationTemplatesTab>(() => 'success');

  // Load user-specific active tab; URL ?templateTab= overrides saved preference
  useEffect(() => {
    if (typeof window === 'undefined' || !currentUser || hasLoadedUserTabRef.current) {
      return;
    }
    hasLoadedUserTabRef.current = true;

    const tabFromUrl = parseNotificationTemplatesTab(searchParams.get('templateTab'));
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
      setUserLocalStorageItem('notification-templates-active-tab', currentUser.id, tabFromUrl);
      return;
    }

    const savedTab = getUserLocalStorageItem('notification-templates-active-tab', currentUser.id);
    const parsedSavedTab = parseNotificationTemplatesTab(savedTab);
    if (parsedSavedTab) {
      setActiveTab(parsedSavedTab);
    }
  }, [currentUser, searchParams]);

  // Load template language setting on mount
  useEffect(() => {
    async function loadLanguageSetting() {
      try {
        const response = await fetch('/api/configuration/unified');
        const data = await response.json();
        if (data.templates?.language) {
          setTemplateLanguage(data.templates.language);
        }
      } catch (error) {
        console.error('Failed to load template language:', error);
      } finally {
        setIsLoadingLanguage(false);
      }
    }
    loadLanguageSetting();
  }, []);
  
  // Store refs for all fields (title, tags, message) for each template type
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  // Track which field is focused for each template type
  const [focusedField, setFocusedField] = useState<Record<string, keyof NotificationTemplate | null>>({
    success: null,
    warning: null,
    overdueBackup: null,
  });

  // Create stable ref callback functions to avoid immutability errors
  const createRefCallback = useCallback((key: string) => {
    return (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      if (el) {
        fieldRefs.current[key] = el;
      }
    };
  }, []);

  // Apply ?templateTab= when navigating from another settings page (e.g. Daily Summary)
  useEffect(() => {
    const tabFromUrl = parseNotificationTemplatesTab(searchParams.get('templateTab'));
    if (!tabFromUrl) {
      return;
    }
    setActiveTab(tabFromUrl);
    if (typeof window !== 'undefined' && currentUser) {
      setUserLocalStorageItem('notification-templates-active-tab', currentUser.id, tabFromUrl);
    }
  }, [searchParams, currentUser]);

  // Update localStorage when activeTab changes
  const handleTabChange = (value: string) => {
    const newTab = parseNotificationTemplatesTab(value);
    if (!newTab) {
      return;
    }
    setActiveTab(newTab);
    setSelectedVariable(''); // Reset selection when changing tabs
    
    // Persist to localStorage
    if (typeof window !== 'undefined' && currentUser) {
      setUserLocalStorageItem('notification-templates-active-tab', currentUser.id, newTab);
    }
  };

  const updateTemplate = (
    templateType: 'success' | 'warning' | 'overdueBackup',
    field: keyof NotificationTemplate,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        [field]: value,
      },
    }));
  };

  // Track focus for each field
  const handleFieldFocus = useCallback((field: keyof NotificationTemplate) => {
    setFocusedField(prev => ({ ...prev, [activeTab === 'overdue' ? 'overdueBackup' : activeTab]: field }));
  }, [activeTab]);

  const updateDailySummaryTemplate = (field: DailySummaryField, value: string) => {
    setFormData(prev => ({
      ...prev,
      dailySummary: {
        ...prev.dailySummary,
        email: {
          ...prev.dailySummary.email,
          [field]: value,
        },
      },
    }));
  };

  const insertDailySummaryVariable = () => {
    if (!selectedVariable) return;
    const currentFocusedField = dailySummaryFocusedField;
    const refKey = `daily-summary-${currentFocusedField}`;
    const field = fieldRefs.current[refKey];
    if (!field) return;
    const currentValue = formData.dailySummary.email[currentFocusedField] || '';
    let cursorPosition: number | null = null;
    if (
      typeof field.selectionStart !== 'number'
      || (field.selectionStart === 0 && field.selectionEnd === 0 && document.activeElement !== field)
    ) {
      cursorPosition = currentValue.length;
    } else {
      cursorPosition = field.selectionStart;
    }
    const variableText = ` {${selectedVariable}} `;
    const newValue =
      currentValue.slice(0, cursorPosition)
      + variableText
      + currentValue.slice(cursorPosition);
    updateDailySummaryTemplate(currentFocusedField, newValue);
    setTimeout(() => {
      field.focus();
      const newCursorPos = (cursorPosition ?? currentValue.length) + variableText.length;
      field.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle language change
  async function handleLanguageChange(newLanguage: SupportedTemplateLanguage) {
    const previousLanguage = templateLanguage;
    setTemplateLanguage(newLanguage); // Optimistic update

    try {
      await authenticatedRequestWithRecovery('/api/configuration/templates', {
        method: 'POST',
        body: JSON.stringify({ templates: { language: newLanguage } }),
      });

      toast({
        duration: 2000,
        title: t("Success"),
        description: t("Template settings saved successfully"),
      });

      // Notify other components that configuration has been saved
      window.dispatchEvent(new Event('configuration-saved'));
    } catch (error) {
      console.error('Failed to save language:', error);
      // Revert to previous language on error
      setTemplateLanguage(previousLanguage);
      toast({
        duration: 3000,
        title: t("Error"),
        description: t("Failed to save template settings"),
        variant: "destructive",
      });
    }
  }

  // Insert variable into the currently focused field, fallback to message
  const insertVariable = (templateType: 'success' | 'warning' | 'overdueBackup') => {
    if (!selectedVariable) return;
    const currentFocusedField = focusedField[templateType] || 'message';
    const refKey = `${templateType}-${currentFocusedField}`;
    const field = fieldRefs.current[refKey];
    if (!field) return;
    const currentValue = formData[templateType][currentFocusedField] || '';
    let cursorPosition: number | null = null;
    if (
      typeof field.selectionStart !== 'number' ||
      (field.selectionStart === 0 && field.selectionEnd === 0 && document.activeElement !== field)
    ) {
      cursorPosition = currentValue.length;
    } else {
      cursorPosition = field.selectionStart;
    }
    const variableText = ` {${selectedVariable}} `;
    const newValue =
      currentValue.slice(0, cursorPosition) +
      variableText +
      currentValue.slice(cursorPosition);
    updateTemplate(templateType, currentFocusedField, newValue);
    setTimeout(() => {
      field.focus();
      const newCursorPos = (cursorPosition ?? currentValue.length) + variableText.length;
      field.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const body = activeTab === 'daily-summary'
        ? { kind: 'dailySummaryEmail' as const, dailySummary: formData.dailySummary }
        : (() => {
            const kind = activeTab === 'overdue' ? 'overdueBackup' as const : activeTab;
            return { kind, template: formData[kind] };
          })();
      const response = await authenticatedRequestWithRecovery('/api/notifications/preview', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t('Failed to generate preview') }));
        throw new Error(errorData.error || t('Failed to generate preview'));
      }
      const data = await response.json() as { emailHtml?: string; emailText?: string; ntfyMessage?: string };
      setPreviewHtml(data.emailHtml || '');
      setPreviewText(data.emailText || '');
      setPreviewNtfy(data.ntfyMessage || '');
      setPreviewView('html');
      setIsPreviewOpen(true);
    } catch (error) {
      toast({
        title: t('Preview failed'),
        description: error instanceof Error ? error.message : t('Failed to generate preview'),
        variant: 'destructive',
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        duration: 2000,
        title: t("Success"),
        description: t("Template settings saved successfully"),
      });
    } catch (error) {
      console.error('Error saving templates:', error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : t("Failed to save template settings");
      toast({
        duration: 3000,
        title: t("Error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!onSendTest || activeTab === 'daily-summary') return;

    setIsSendingTest(true);
    try {
      const templateType = activeTab === 'overdue' ? 'overdueBackup' : activeTab;
      const template = formData[templateType];

      // Create a test template with variables replaced by their names
      const testTemplate: NotificationTemplate = {
        ...template,
        title: template.title?.replace(/\{(\w+)\}/g, '{$1}') || '',
        message: template.message?.replace(/\{(\w+)\}/g, '{$1}') || '',
      };

      await onSendTest(testTemplate);
      toast({
        duration: 2000,
        title: t("Success"),
        description: t("Test notification sent using {{template}} template", {
          template: notificationTemplateTitleForTab(activeTab),
        }),
      });
    } catch (error) {
      console.error('Error sending test notification:', error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : t("Failed to send test notification");
      toast({
        duration: 3000,
        title: t("Error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleResetToDefault = () => {
    setIsResetSingleDialogOpen(true);
  };

  const confirmResetToDefault = async () => {
    setIsResetSingleDialogOpen(false);
    setIsSaving(true);
    try {
      if (activeTab === 'daily-summary') {
        const defaults = getDefaultDailySummaryTemplates(templateLanguage);
        setFormData(prev => ({
          ...prev,
          dailySummary: defaults,
        }));
        toast({
          duration: 2000,
          title: t("Reset Complete"),
          description: t("{{template}} has been reset to default", {
            template: t("Daily Summary"),
          }),
        });
        return;
      }
      const templateType = activeTab === 'overdue' ? 'overdueBackup' : activeTab;
      const response = await fetch(
        `/api/configuration/templates/defaults?language=${templateLanguage}`
      );
      const defaults = await response.json();

      // Only reset title and message for the selected template type
      // Preserve user's priority and tags
      const defaultTemplate = defaults[templateType];
      if (defaultTemplate) {
        setFormData(prev => ({
          ...prev,
          [templateType]: {
            ...prev[templateType],
            title: defaultTemplate.title,
            message: defaultTemplate.message,
          },
        }));
      }

      toast({
        duration: 2000,
        title: t("Reset this template to default"),
        description: t("{{template}} template has been reset to default values", {
          template: notificationTemplateTitleForTab(activeTab),
        }),
      });
    } catch (error) {
      console.error('Failed to reset template:', error);
      toast({
        duration: 3000,
        title: t("Error"),
        description: t("Failed to reset template"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAllToDefault = () => {
    setIsResetAllDialogOpen(true);
  };

  const confirmResetAllToDefault = async () => {
    setIsResetAllDialogOpen(false);
    const languageName = templateLanguageName(templateLanguage);

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/configuration/templates/defaults?language=${templateLanguage}`
      );
      const defaults = await response.json();

      // Reset all templates (success, warning, overdue) - only title and message, preserving priority and tags
      setFormData(prev => ({
        success: {
          ...prev.success,
          title: defaults.success.title,
          message: defaults.success.message,
        },
        warning: {
          ...prev.warning,
          title: defaults.warning.title,
          message: defaults.warning.message,
        },
        overdueBackup: {
          ...prev.overdueBackup,
          title: defaults.overdueBackup.title,
          message: defaults.overdueBackup.message,
        },
        dailySummary: defaults.dailySummary || prev.dailySummary,
      }));

      toast({
        duration: 3000,
        title: t("Reset all to default"),
        description: t("All templates have been reset to {{language}} defaults", { language: languageName }),
      });
    } catch (error) {
      console.error('Failed to reset all templates:', error);
      toast({
        duration: 3000,
        title: t("Error"),
        description: t("Failed to reset all templates"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
          <TabsTrigger value="success" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t("Success")}
          </TabsTrigger>
          <TabsTrigger value="warning" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">{t("Warning/Error")}</span>
            <span className="md:hidden">{t("Warning")}</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">{t("Overdue Backup")}</span>
            <span className="md:hidden">{t("Overdue")}</span>
          </TabsTrigger>
          <TabsTrigger value="daily-summary" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            {t("Daily Summary")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="success" className="mt-6">
          <TemplateEditor
            templateType="success"
            template={formData.success}
            title={t("Success Notification Template")}
            description={t("Template used when backups complete successfully")}
            selectedVariable={selectedVariable}
            t={t}
            setSelectedVariable={setSelectedVariable}
            insertVariable={insertVariable}
            updateTemplate={updateTemplate}
            fieldRefs={fieldRefs}
            onFieldFocus={handleFieldFocus}
            activeTab={activeTab}
            createRefCallback={createRefCallback}
          />
        </TabsContent>

        <TabsContent value="warning" className="mt-6">
          <TemplateEditor
            templateType="warning"
            template={formData.warning}
            title={t("Warning/Error Notification Template")}
            description={t("Template used when backups complete with warnings or errors")}
            selectedVariable={selectedVariable}
            t={t}
            setSelectedVariable={setSelectedVariable}
            insertVariable={insertVariable}
            updateTemplate={updateTemplate}
            fieldRefs={fieldRefs}
            onFieldFocus={handleFieldFocus}
            activeTab={activeTab}
            createRefCallback={createRefCallback}
          />
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          <TemplateEditor
            templateType="overdueBackup"
            template={formData.overdueBackup}
            title={t("Overdue Backup Notification Template")}
            description={t("Template used when expected backups are overdue based on the configured interval")}
            selectedVariable={selectedVariable}
            t={t}
            setSelectedVariable={setSelectedVariable}
            insertVariable={insertVariable}
            updateTemplate={updateTemplate}
            fieldRefs={fieldRefs}
            onFieldFocus={handleFieldFocus}
            activeTab={activeTab}
            createRefCallback={createRefCallback}
          />
        </TabsContent>

        <TabsContent value="daily-summary" className="mt-6">
          <DailySummaryEmailEditor
            template={formData.dailySummary.email}
            title={t('Daily Summary email template')}
            description={t('Markdown email subject and body for the daily snapshot.')}
            selectedVariable={selectedVariable}
            setSelectedVariable={setSelectedVariable}
            insertVariable={insertDailySummaryVariable}
            updateTemplate={updateDailySummaryTemplate}
            createRefCallback={createRefCallback}
            onFieldFocus={setDailySummaryFocusedField}
            t={t}
          />
        </TabsContent>
      </Tabs>

      <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Left side: All buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={handleSave} disabled={isSaving} variant="gradient" className="w-full sm:w-auto">
            {isSaving ? t("Saving...") : t("Save Template Settings")}
          </Button>
          <Button
            onClick={() => void handlePreview()}
            variant="outline"
            disabled={isPreviewing}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Eye className="h-4 w-4" />
            {isPreviewing ? t("Generating...") : t("Preview")}
          </Button>
          {onSendTest && activeTab !== 'daily-summary' && (
            <Button
              onClick={handleSendTest}
              disabled={isSendingTest}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">{isSendingTest ? t("Sending...") : t("Send Test Notification")}</span>
              <span className="sm:hidden">{isSendingTest ? t("Sending...") : t("Send Test")}</span>
            </Button>
          )}
          <Button
            onClick={handleResetToDefault}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Reset this template to default")}</span>
            <span className="sm:hidden">{t("Reset")}</span>
          </Button>
          <Button
            onClick={handleResetAllToDefault}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            {t("Reset all to default")}
          </Button>
        </div>

        {/* Right side: Language selector with tooltip */}
        <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Label htmlFor="template-language-select">{t("Template Language")}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm">
                  <p>{t("Language for default notification templates. Changing this does not affect already customized templates. If you are changing languages, you need to use the reset buttons to load the new language defaults.")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={templateLanguage}
            onValueChange={(value) => handleLanguageChange(value as SupportedTemplateLanguage)}
            disabled={isLoadingLanguage}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_TEMPLATE_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {templateLanguageName(lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(previewHtml || previewText || previewNtfy) && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="flex max-h-[92vh] w-[min(100vw-2rem,72rem)] max-w-none flex-col overflow-hidden sm:max-w-none">
            <DialogHeader>
              <DialogTitle>{t('Preview')}</DialogTitle>
              <DialogDescription>
                {activeTab === 'daily-summary'
                  ? t('Email HTML and plain text rendered from the current template without sending.')
                  : t('Email HTML, plain text, and NTFY rendered from the current template without sending.')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={previewView === 'html' ? 'default' : 'outline'} onClick={() => setPreviewView('html')}>{t('Email HTML')}</Button>
                <Button type="button" size="sm" variant={previewView === 'text' ? 'default' : 'outline'} onClick={() => setPreviewView('text')}>{t('Plain text')}</Button>
                {activeTab !== 'daily-summary' && previewNtfy && (
                  <Button type="button" size="sm" variant={previewView === 'ntfy' ? 'default' : 'outline'} onClick={() => setPreviewView('ntfy')}>{t('NTFY')}</Button>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-auto scrollbar-gutter-stable px-1">
                {previewView === 'html' && (
                  <EmailHtmlPreviewIframe
                    title={t('Email HTML preview')}
                    html={previewHtml}
                    className="min-h-[62vh]"
                  />
                )}
                {previewView === 'text' && (
                  <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{previewText}</pre>
                )}
                {previewView === 'ntfy' && (
                  <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{previewNtfy}</pre>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Single Template Confirmation Dialog */}
      <AlertDialog open={isResetSingleDialogOpen} onOpenChange={setIsResetSingleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Reset this template to default")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Reset template to default? This will use the {{language}} default template.", {
                language: templateLanguageName(templateLanguage),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetToDefault}>
              {t("Reset this template to default")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset All Templates Confirmation Dialog */}
      <AlertDialog open={isResetAllDialogOpen} onOpenChange={setIsResetAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Reset all to default")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Reset all templates to default in {{language}}? This will replace all template messages and titles with the {{language}} defaults.", {
                language: templateLanguageName(templateLanguage),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetAllToDefault}>
              {t("Reset all to default")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 