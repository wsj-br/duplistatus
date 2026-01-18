"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardPaste, Send, RotateCcw, CheckCircle, AlertTriangle, Clock, Type, Star, Tag, MessageSquare } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { useToast } from '@/components/ui/use-toast';
import { NotificationTemplate } from '@/lib/types';
import { defaultNotificationTemplates } from '@/lib/default-config';
import { getUserLocalStorageItem, setUserLocalStorageItem } from '@/lib/user-local-storage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useIntlayer } from 'react-intlayer';

// Helper function to create template variables - will be used inside component with content
const createTemplateVariables = (content: any) => [
  { name: 'server_name', description: content.variableServerName.value },
  { name: 'server_alias', description: content.variableServerAlias.value },
  { name: 'server_note', description: content.variableServerNote.value },
  { name: 'server_url', description: content.variableServerUrl.value },
  { name: 'backup_name', description: content.variableBackupName.value },
  { name: 'backup_date', description: content.variableBackupDate.value },
  { name: 'status', description: content.variableStatus.value },
  { name: 'messages_count', description: content.variableMessagesCount.value },
  { name: 'warnings_count', description: content.variableWarningsCount.value },
  { name: 'errors_count', description: content.variableErrorsCount.value },
  { name: 'log_text', description: content.variableLogText.value },
  { name: 'duration', description: content.variableDuration.value },
  { name: 'file_count', description: content.variableFileCount.value },
  { name: 'file_size', description: content.variableFileSize.value },
  { name: 'uploaded_size', description: content.variableUploadedSize.value },
  { name: 'storage_size', description: content.variableStorageSize.value },
  { name: 'available_versions', description: content.variableAvailableVersions.value },
];

const createTemplateVariablesOverdueBackup = (content: any) => [
  { name: 'server_name', description: content.variableServerName.value },
  { name: 'server_alias', description: content.variableServerAlias.value },
  { name: 'server_note', description: content.variableServerNote.value },
  { name: 'server_url', description: content.variableServerUrl.value },
  { name: 'backup_name', description: content.variableBackupName.value },
  { name: 'last_backup_date', description: content.variableLastBackupDate.value },
  { name: 'last_elapsed', description: content.variableLastElapsed.value },
  { name: 'expected_date', description: content.variableExpectedDate.value },
  { name: 'expected_elapsed', description: content.variableExpectedElapsed.value },
  { name: 'backup_interval', description: content.variableBackupInterval.value },
  { name: 'overdue_tolerance', description: content.variableOverdueTolerance.value },
];

interface NotificationTemplatesFormProps {
  templates?: {
    success?: NotificationTemplate;
    warning?: NotificationTemplate;
    overdueBackup?: NotificationTemplate;
  };
  onSave: (templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    overdueBackup: NotificationTemplate;
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
  content,
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
  activeTab: 'success' | 'warning' | 'overdue';
  createRefCallback: (key: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
  content: any;
}) => {
  // Determine which variable list to use based on active tab
  const variablesList = useMemo(() => {
    return activeTab === 'overdue' 
      ? createTemplateVariablesOverdueBackup(content)
      : createTemplateVariables(content);
  }, [activeTab, content]);

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
                <SelectValue placeholder={content.selectVariable.value} />
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
              {content.insert}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-title`} className="flex items-center gap-2">
              <ColoredIcon icon={Type} color="blue" size="sm" />
              {content.titleLabel}
            </Label>
            <Input
              id={`${templateType}-title`}
              value={template.title || ''}
              onChange={(e) => updateTemplate(templateType, 'title', e.target.value)}
              placeholder={content.enterNotificationTitle.value}
              ref={createRefCallback(`${templateType}-title`)}
              onFocus={() => onFieldFocus('title')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-priority`} className="flex items-center gap-2">
              <ColoredIcon icon={Star} color="yellow" size="sm" />
              {content.priority}
            </Label>
            <Select
              value={template.priority || 'default'}
              onValueChange={(value) => updateTemplate(templateType, 'priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="max">{content.priorityMax.value}</SelectItem>
                <SelectItem value="high">{content.priorityHigh.value}</SelectItem>
                <SelectItem value="default">{content.priorityDefault.value}</SelectItem>
                <SelectItem value="low">{content.priorityLow.value}</SelectItem>
                <SelectItem value="min">{content.priorityMin.value}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-tags`} className="flex items-center gap-2">
              <ColoredIcon icon={Tag} color="green" size="sm" />
              {content.tags}
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
            {content.messageTemplate}
          </Label>
          <Textarea
            ref={createRefCallback(`${templateType}-message`)}
            id={`${templateType}-message`}
            value={template.message || ''}
            onChange={(e) => updateTemplate(templateType, 'message', e.target.value)}
            placeholder={content.enterMessageTemplate.value}
            className="min-h-[262px]"
            onFocus={() => onFieldFocus('message')}
          />
          <p className="text-sm text-muted-foreground">
            {content.tipInsertVariable.value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function NotificationTemplatesForm({ templates, onSave, onSendTest }: NotificationTemplatesFormProps) {
  const content = useIntlayer('notification-templates-form');
  const common = useIntlayer('common');
  const { toast } = useToast();
  const currentUser = useCurrentUser();
  const [formData, setFormData] = useState(() => {
    // Ensure we have default templates if the provided templates are incomplete
    return {
      success: templates?.success || defaultNotificationTemplates.success,
      warning: templates?.warning || defaultNotificationTemplates.warning,
      overdueBackup: templates?.overdueBackup || defaultNotificationTemplates.overdueBackup,
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const hasLoadedUserTabRef = useRef(false);
  
  // Initialize activeTab from localStorage or default to 'success'
  const [activeTab, setActiveTab] = useState<'success' | 'warning' | 'overdue'>(() => {
    return 'success';
  });

  // Load user-specific active tab when user is available
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser && !hasLoadedUserTabRef.current) {
      hasLoadedUserTabRef.current = true;
      const savedTab = getUserLocalStorageItem('notification-templates-active-tab', currentUser.id);
      if (savedTab === 'success' || savedTab === 'warning' || savedTab === 'overdue') {
        setActiveTab(savedTab);
      }
    }
  }, [currentUser]);
  
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

  // Update localStorage when activeTab changes
  const handleTabChange = (value: string) => {
    const newTab = value as 'success' | 'warning' | 'overdue';
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        duration: 2000,
        title: common.status.success,
        description: content.templateSettingsSavedSuccessfully,
      });
    } catch (error) {
      console.error('Error saving templates:', error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : content.failedToSaveTemplateSettings;
      toast({
        duration: 3000,
        title: common.status.error,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!onSendTest) return;
    
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
        title: "Test Sent",
        description: `Test notification sent using ${activeTab} template`,
      });
    } catch (error) {
      console.error('Error sending test notification:', error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : 'Failed to send test notification';
      toast({
        duration: 3000,
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleResetToDefault = () => {
    const templateType = activeTab === 'overdue' ? 'overdueBackup' : activeTab;
    const defaultTemplate = defaultNotificationTemplates[templateType];
    
    setFormData(prev => ({
      ...prev,
      [templateType]: defaultTemplate,
    }));
    
    toast({
      duration: 2000,
      title: content.resetToDefault,
      description: content.templateResetToDefault.value.replace('{template}', activeTab),
    });
  };

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="success" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {content.successTab}
          </TabsTrigger>
          <TabsTrigger value="warning" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">{content.warningTab}</span>
            <span className="md:hidden">{content.warningTabShort}</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">{content.overdueTab}</span>
            <span className="md:hidden">{content.overdueTabShort}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="success" className="mt-6">
          <TemplateEditor
            templateType="success"
            template={formData.success}
            title={content.successTemplateTitle.value}
            description={content.successTemplateDescription.value}
            selectedVariable={selectedVariable}
            content={content}
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
            title={content.warningTemplateTitle.value}
            description={content.warningTemplateDescription.value}
            selectedVariable={selectedVariable}
            content={content}
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
            title={content.overdueTemplateTitle.value}
            description={content.overdueTemplateDescription.value}
            selectedVariable={selectedVariable}
            content={content}
            setSelectedVariable={setSelectedVariable}
            insertVariable={insertVariable}
            updateTemplate={updateTemplate}
            fieldRefs={fieldRefs}
            onFieldFocus={handleFieldFocus}
            activeTab={activeTab}
            createRefCallback={createRefCallback}
          />
        </TabsContent>
      </Tabs>

      <div className="pt-4 flex flex-col sm:flex-row gap-2">
        <Button onClick={handleSave} disabled={isSaving} variant="gradient" className="w-full sm:w-auto">
          {isSaving ? content.saving : content.saveTemplateSettings}
        </Button>
        {onSendTest && (
          <Button 
            onClick={handleSendTest} 
            disabled={isSendingTest}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{isSendingTest ? content.sending : content.sendTestNotification}</span>
            <span className="sm:hidden">{isSendingTest ? content.sending : content.sendTest}</span>
          </Button>
        )}
        <Button 
          onClick={handleResetToDefault} 
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">{content.resetToDefault}</span>
          <span className="sm:hidden">{content.reset}</span>
        </Button>
      </div>
    </div>
  );
} 