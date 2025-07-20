"use client";

import { useState, useRef } from 'react';
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
  { name: 'link', description: 'Link to duplistatus backup detail page' },
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
  textareaRefs
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
  textareaRefs: React.RefObject<Record<string, HTMLTextAreaElement | null>>;
}) => (
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
              {TEMPLATE_VARIABLES.map((variable) => (
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
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`${templateType}-message`}>Message Template</Label>
        <Textarea
          ref={(el) => {
            textareaRefs.current[`${templateType}-message`] = el;
          }}
          id={`${templateType}-message`}
          value={template.message || ''}
          onChange={(e) => updateTemplate(templateType, 'message', e.target.value)}
          placeholder="Enter your message template using variables like {machine_name}, {backup_name}, {status}, etc."
          className="min-h-[200px]"
        />
        <p className="text-sm text-muted-foreground">
          Example: &quot;Backup &#123;backup_name&#125; on &#123;machine_name&#125; completed with status &#123;status&#125; at &#123;backup_date&#125;&quot;
        </p>
      </div>
    </CardContent>
  </Card>
);

export function NotificationTemplatesForm({ templates, onSave, onSendTest }: NotificationTemplatesFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(templates);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'success' | 'warning' | 'missed'>('success');
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

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

  const insertVariable = (templateType: 'success' | 'warning' | 'missedBackup') => {
    if (!selectedVariable) return;

    const textarea = textareaRefs.current[`${templateType}-message`];
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const currentValue = formData[templateType].message || '';
    const variableText = `{${selectedVariable}}`;
    
    const newValue = 
      currentValue.slice(0, cursorPosition) + 
      variableText + 
      currentValue.slice(cursorPosition);

    updateTemplate(templateType, 'message', newValue);

    // Set focus back to textarea and position cursor after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        cursorPosition + variableText.length,
        cursorPosition + variableText.length
      );
    }, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        title: "Success",
        description: "Template settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
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
        title: "Test Sent",
        description: `Test notification sent using ${activeTab} template`,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'success' | 'warning' | 'missed')} className="w-full">
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
            textareaRefs={textareaRefs}
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
            textareaRefs={textareaRefs}
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
            textareaRefs={textareaRefs}
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