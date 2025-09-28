"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Mail, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { authenticatedRequest } from '@/lib/client-session-csrf';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  mailto: string;
  enabled: boolean;
}

export function EmailConfigurationForm() {
  const { toast } = useToast();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    mailto: '',
    enabled: false
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Load email configuration from database
  useEffect(() => {
    const loadEmailConfig = async () => {
      try {
        const response = await fetch('/api/configuration/email');
        if (response.ok) {
          const data = await response.json();
          if (data.configured && data.config) {
            setEmailConfig(data.config);
          }
        }
      } catch (error) {
        console.error('Failed to load email configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmailConfig();
  }, []);

  const handleInputChange = (field: keyof EmailConfig, value: string | number | boolean) => {
    setEmailConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await authenticatedRequest('/api/configuration/email', {
        method: 'POST',
        body: JSON.stringify(emailConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      toast({
        title: "Configuration Saved",
        description: "SMTP configuration saved successfully!",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save configuration",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {

    setIsTesting(true);
    try {
      const response = await authenticatedRequest('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ 
          type: 'email',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test email');
      }

      toast({
        title: "Test Email Sent",
        description: "Test email sent successfully! Check your inbox.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sending test email:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Test Email Failed",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading email configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure SMTP settings for email notifications. Settings are stored securely in the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                  placeholder="587"
                  min="1"
                  max="65535"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input
                id="smtp-username"
                type="text"
                value={emailConfig.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <div className="relative">
                <Input
                  id="smtp-password"
                  type={showPassword ? "text" : "password"}
                  value={emailConfig.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Your email password or app password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-mailto">Recipient Email</Label>
              <Input
                id="smtp-mailto"
                type="email"
                value={emailConfig.mailto}
                onChange={(e) => handleInputChange('mailto', e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="smtp-secure"
                checked={emailConfig.secure}
                onCheckedChange={(checked) => handleInputChange('secure', checked)}
              />
              <Label htmlFor="smtp-secure">
                Use secure connection (SSL/TLS)
                <span className="text-sm text-muted-foreground ml-2">
                  {emailConfig.secure ? '(Direct SSL/TLS, recommended for port 465)' : '(STARTTLS, recommended for port 587)'}
                </span>
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
            
            <Button
              onClick={handleTestEmail}
              disabled={isTesting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {isTesting ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-2">Common SMTP Settings:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">Gmail:</span>
                  <span>smtp.gmail.com:587 (TLS)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">Outlook:</span>
                  <span>smtp-mail.outlook.com:587 (TLS)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">Yahoo:</span>
                  <span>smtp.mail.yahoo.com:587 (TLS)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Security Notes:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>For Gmail, use an App Password instead of your regular password</li>
                <li>Environment variables are not displayed for security reasons</li>
                <li>Restart the application after changing environment variables</li>
                <li>The system automatically detects email configuration on startup</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
