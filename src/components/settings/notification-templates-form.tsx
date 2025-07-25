"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardPaste, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { NotificationTemplate } from '@/lib/types';

// Available placeholder variables for templates
const TEMPLATE_VARIABLES = [
  { name: 'machine_name', description: 'Name of the machine' },
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
  { name: 'available_versions', description: 'Number of available backup versions' },
];

// Available placeholder variables for templates
const TEMPLATE_VARIABLES_MISSED_BACKUP = [
  { name: 'machine_name', description: 'Name of the machine' },
  { name: 'backup_name', description: 'Name of the backup' },
  { name: 'last_backup_date', description: 'Date/time of the last backup' },
  { name: 'last_elapsed', description: 'Time ago since the last backup' },
  { name: 'backup_interval_type', description: 'Backup interval type (days, hours)' },
  { name: 'backup_interval_value', description: 'Backup interval value (1, 2, 3, etc.)' },
];

interface NotificationTemplatesFormProps {
  templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    missedBackup: NotificationTemplate;
  };
  onSave: (templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    missedBackup: NotificationTemplate;
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
}: { 
  templateType: 'success' | 'warning' | 'missedBackup';
  template: NotificationTemplate;
  title: string;
  description: string;
  selectedVariable: string;
  setSelectedVariable: (value: string) => void;
  insertVariable: (templateType: 'success' | 'warning' | 'missedBackup') => void;
  updateTemplate: (
    templateType: 'success' | 'warning' | 'missedBackup',
    field: keyof NotificationTemplate,
    value: string
  ) => void;
  fieldRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>;
  onFieldFocus: (field: keyof NotificationTemplate) => void;
  activeTab: 'success' | 'warning' | 'missed';
}) => {
  // Determine which variable list to use based on active tab
  const variablesList = activeTab === 'missed' ? TEMPLATE_VARIABLES_MISSED_BACKUP : TEMPLATE_VARIABLES;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedVariable} onValueChange={setSelectedVariable}>
              <SelectTrigger className="w-64">
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
              className="flex items-center gap-1"
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
            <Label htmlFor={`${templateType}-title`}>Title</Label>
            <Input
              id={`${templateType}-title`}
              value={template.title || ''}
              onChange={(e) => updateTemplate(templateType, 'title', e.target.value)}
              placeholder="Enter notification title"
              ref={el => { fieldRefs.current[`${templateType}-title`] = el; }}
              onFocus={() => onFieldFocus('title')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${templateType}-priority`}>Priority</Label>
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
            <Label htmlFor={`${templateType}-tags`}>Tags (comma separated)</Label>
            <Input
              id={`${templateType}-tags`}
              value={template.tags || ''}
              onChange={(e) => updateTemplate(templateType, 'tags', e.target.value)}
              placeholder=""
              ref={el => { fieldRefs.current[`${templateType}-tags`] = el; }}
              onFocus={() => onFieldFocus('tags')}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${templateType}-message`}>Message Template</Label>
          <Textarea
            ref={el => { fieldRefs.current[`${templateType}-message`] = el; }}
            id={`${templateType}-message`}
            value={template.message || ''}
            onChange={(e) => updateTemplate(templateType, 'message', e.target.value)}
            placeholder="Enter your message template using variables like {machine_name}, {backup_name}, {status}, etc."
            className="min-h-[200px]"
            onFocus={() => onFieldFocus('message')}
          />
          <p className="text-sm text-muted-foreground">
            Example: &quot;Backup &#123;backup_name&#125; on &#123;machine_name&#125; completed with status &#123;status&#125; at &#123;backup_date&#125;&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function NotificationTemplatesForm({ templates, onSave, onSendTest }: NotificationTemplatesFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(templates);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'success' | 'warning' | 'missed'>('success');
  // Store refs for all fields (title, tags, message) for each template type
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  // Track which field is focused for each template type
  const [focusedField, setFocusedField] = useState<Record<string, keyof NotificationTemplate | null>>({
    success: null,
    warning: null,
    missedBackup: null,
  });

  const updateTemplate = (
    templateType: 'success' | 'warning' | 'missedBackup',
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
    setFocusedField(prev => ({ ...prev, [activeTab === 'missed' ? 'missedBackup' : activeTab]: field }));
  }, [activeTab]);

  // Insert variable into the currently focused field, fallback to message
  const insertVariable = (templateType: 'success' | 'warning' | 'missedBackup') => {
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
        duration: 5000,
        title: "Success",
        description: "Template settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
        duration: 10000,
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
      const templateType = activeTab === 'missed' ? 'missedBackup' : activeTab;
      const template = formData[templateType];
      
      // Create a test template with variables replaced by their names
      const testTemplate: NotificationTemplate = {
        ...template,
        title: template.title?.replace(/\{(\w+)\}/g, '{$1}') || '',
        message: template.message?.replace(/\{(\w+)\}/g, '{$1}') || '',
      };
      
      await onSendTest(testTemplate);
      toast({
        duration: 5000,
        title: "Test Sent",
        description: `Test notification sent using ${activeTab} template`,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        duration: 10000,
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value as 'success' | 'warning' | 'missed');
        setSelectedVariable(''); // Reset selection when changing tabs
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="success">Success Template</TabsTrigger>
          <TabsTrigger value="warning">Warning/Error Template</TabsTrigger>
          <TabsTrigger value="missed">Missed Backup Template</TabsTrigger>
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
          />
        </TabsContent>
        
        <TabsContent value="missed" className="mt-6">
          <TemplateEditor
            templateType="missedBackup"
            template={formData.missedBackup}
            title="Missed Backup Notification Template"
            description="Template used when expected backups are missed based on the configured interval"
            selectedVariable={selectedVariable}
            setSelectedVariable={setSelectedVariable}
            insertVariable={insertVariable}
            updateTemplate={updateTemplate}
            fieldRefs={fieldRefs}
            onFieldFocus={handleFieldFocus}
            activeTab={activeTab}
          />
        </TabsContent>
      </Tabs>

      <div className="pt-4 flex gap-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Template Settings"}
        </Button>
        {onSendTest && (
          <Button 
            onClick={handleSendTest} 
            disabled={isSendingTest}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSendingTest ? "Sending..." : "Send Test Notification"}
          </Button>
        )}
      </div>
    </div>
  );
} 