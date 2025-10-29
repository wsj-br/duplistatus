"use client";

import { useState, useRef, useCallback } from 'react';
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

// Available placeholder variables for templates
const TEMPLATE_VARIABLES = [
  { name: 'server_name', description: 'Name of the server' },
  { name: 'server_alias', description: 'Alias of the server (server_name if not set)' },
  { name: 'server_note', description: 'Note of the server' },
  { name: 'server_url', description: 'URL of the Duplicati server' },
  { name: 'backup_name', description: 'Name of the backup' },
  { name: 'backup_date', description: 'Date/time of the backup' },
  { name: 'status', description: 'Backup status (Success, Failed, etc.)' },
  { name: 'messages_count', description: 'Number of messages' },
  { name: 'warnings_count', description: 'Number of warnings' },
  { name: 'errors_count', description: 'Number of errors' },
  { name: 'duration', description: 'Backup duration' },
  { name: 'file_count', description: 'Number of files processed' },
  { name: 'file_size', description: 'Total file size' },
  { name: 'uploaded_size', description: 'Size of uploaded data' },
  { name: 'storage_size', description: 'Storage size used' },
  { name: 'available_versions', description: 'Number of available versions' },
];

// Available placeholder variables for templates
const TEMPLATE_VARIABLES_OVERDUE_BACKUP = [
  { name: 'server_name', description: 'Name of the server' },
  { name: 'server_alias', description: 'Alias of the server (server_name if not set)' },
  { name: 'server_note', description: 'Note of the server' },
  { name: 'server_url', description: 'URL of the Duplicati server' },
  { name: 'backup_name', description: 'Name of the backup' },
  { name: 'last_backup_date', description: 'Date/time of the last backup' },
  { name: 'last_elapsed', description: 'Time ago since the last backup' },
  { name: 'expected_date', description: 'Date/time when the backup was expected' },
  { name: 'expected_elapsed', description: 'Time elapsed since the expected backup date' },
  { name: 'backup_interval', description: 'Backup interval string (e.g., "1D", "2W", "1M")' },
  { name: 'overdue_tolerance', description: 'Configured overdue tolerance (1 hour, 1 day, etc.)' },
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
}) => {
  // Determine which variable list to use based on active tab
  const variablesList = activeTab === 'overdue' ? TEMPLATE_VARIABLES_OVERDUE_BACKUP : TEMPLATE_VARIABLES;

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
                <SelectValue placeholder="Select variable..." />
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
              Insert
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-title`} className="flex items-center gap-2">
              <ColoredIcon icon={Type} color="blue" size="sm" />
              Title
            </Label>
            <Input
              id={`${templateType}-title`}
              value={template.title || ''}
              onChange={(e) => updateTemplate(templateType, 'title', e.target.value)}
              placeholder="Enter notification title"
              ref={createRefCallback(`${templateType}-title`)}
              onFocus={() => onFieldFocus('title')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-priority`} className="flex items-center gap-2">
              <ColoredIcon icon={Star} color="yellow" size="sm" />
              Priority
            </Label>
            <Select
              value={template.priority || 'default'}
              onValueChange={(value) => updateTemplate(templateType, 'priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="max">Max/Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="min">Min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-tags`} className="flex items-center gap-2">
              <ColoredIcon icon={Tag} color="green" size="sm" />
              Tags (comma separated)
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
            Message Template
          </Label>
          <Textarea
            ref={createRefCallback(`${templateType}-message`)}
            id={`${templateType}-message`}
            value={template.message || ''}
            onChange={(e) => updateTemplate(templateType, 'message', e.target.value)}
            placeholder="Enter your message template using variables like {server_name}, {backup_name}, {status}, etc."
            className="min-h-[200px]"
            onFocus={() => onFieldFocus('message')}
          />
          <p className="text-sm text-muted-foreground">
            Tip: to insert a variable, place your cursor where you want it, choose the variable, and click &apos;Insert&apos;.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function NotificationTemplatesForm({ templates, onSave, onSendTest }: NotificationTemplatesFormProps) {
  const { toast } = useToast();
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
  
  // Initialize activeTab from localStorage or default to 'success'
  const [activeTab, setActiveTab] = useState<'success' | 'warning' | 'overdue'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('notification-templates-active-tab');
      if (savedTab === 'success' || savedTab === 'warning' || savedTab === 'overdue') {
        return savedTab;
      }
    }
    return 'success';
  });
  
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification-templates-active-tab', newTab);
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
        title: "Success",
        description: "Template settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving templates:', error instanceof Error ? error.message : String(error));
      toast({
        duration: 3000,
        title: "Error",
        description: "Failed to save template settings",
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
      toast({
        duration: 3000,
        title: "Error",
        description: "Failed to send test notification",
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
      title: "Reset to Default",
      description: `${activeTab} template has been reset to default values`,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="success" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Success
          </TabsTrigger>
          <TabsTrigger value="warning" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">Warning/Error</span>
            <span className="md:hidden">Warning</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs md:text-sm py-2 px-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">Overdue Backup</span>
            <span className="md:hidden">Overdue</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="success" className="mt-6">
          <TemplateEditor
            templateType="success"
            template={formData.success}
            title="Success Notification Template"
            description="Template used when backups complete successfully"
            selectedVariable={selectedVariable}
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
            title="Warning/Error Notification Template"
            description="Template used when backups complete with warnings or errors"
            selectedVariable={selectedVariable}
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
            title="Overdue Backup Notification Template"
            description="Template used when expected backups are overdue based on the configured interval"
            selectedVariable={selectedVariable}
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
          {isSaving ? "Saving..." : "Save Template Settings"}
        </Button>
        {onSendTest && (
          <Button 
            onClick={handleSendTest} 
            disabled={isSendingTest}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{isSendingTest ? "Sending..." : "Send Test Notification"}</span>
            <span className="sm:hidden">{isSendingTest ? "Sending..." : "Send Test"}</span>
          </Button>
        )}
        <Button 
          onClick={handleResetToDefault} 
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset to Default</span>
          <span className="sm:hidden">Reset</span>
        </Button>
      </div>
    </div>
  );
} 