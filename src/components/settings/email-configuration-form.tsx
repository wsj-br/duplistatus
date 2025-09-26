"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  mailto: string;
  enabled: boolean;
}

export function EmailConfigurationForm() {
  const { toast } = useToast();
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load email configuration from environment variables
  useEffect(() => {
    const loadEmailConfig = async () => {
      try {
        const response = await fetch('/api/configuration/email');
        if (response.ok) {
          const data = await response.json();
          setEmailConfig(data.config);
          setIsConfigured(data.configured);
        }
      } catch (error) {
        console.error('Failed to load email configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmailConfig();
  }, []);

  const handleTestEmail = async () => {
    if (!isConfigured) {
      toast({
        title: "Configuration Required",
        description: "Email is not configured. Please check environment variables.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
            Configure SMTP settings for email notifications. Email configuration is managed through environment variables for security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Email is configured and ready</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Email is not configured</span>
                </>
              )}
            </div>

            {!isConfigured && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To enable email notifications, please configure the following environment variables:
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                    <li><code className="bg-muted px-1 rounded">SMTP_HOST</code> - SMTP server hostname</li>
                    <li><code className="bg-muted px-1 rounded">SMTP_PORT</code> - SMTP server port</li>
                    <li><code className="bg-muted px-1 rounded">SMTP_SECURE</code> - Use secure connection (true/false)</li>
                    <li><code className="bg-muted px-1 rounded">SMTP_USERNAME</code> - SMTP username</li>
                    <li><code className="bg-muted px-1 rounded">SMTP_PASSWORD</code> - SMTP password</li>
                    <li><code className="bg-muted px-1 rounded">SMTP_MAILTO</code> - Email recipient address</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Configuration Display (if configured) */}
          {isConfigured && emailConfig && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground">Current Configuration</h4>
              
              <div className="rounded-md border">
                <table className="w-full">
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-sm">SMTP_HOST</td>
                      <td className="px-4 py-3 text-sm font-mono bg-muted/30">{emailConfig.host}</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-sm">SMTP_PORT</td>
                      <td className="px-4 py-3 text-sm font-mono bg-muted/30">{emailConfig.port}</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-sm">SMTP_SECURE</td>
                      <td className="px-4 py-3 text-sm bg-muted/30">
                        <div className="flex items-center space-x-2">
                          {emailConfig.secure ? (
                            <>
                              <span className="font-mono">true</span>
                              <span className="text-muted-foreground">(Direct SSL/TLS, recommended for port 465)</span>
                            </>
                          ) : (
                            <>
                              <span className="font-mono">false</span>
                              <span className="text-muted-foreground">(STARTTLS, recommended for port 587)</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium text-sm">SMTP_USERNAME</td>
                        <td className="px-4 py-3 text-sm font-mono bg-muted/30">{emailConfig.username}</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium text-sm">SMTP_MAILTO</td>
                        <td className="px-4 py-3 text-sm font-mono bg-muted/30">{emailConfig.mailto}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              <div className="text-xs text-muted-foreground mt-2">
                <p>💡 Email configuration is managed through environment variables and cannot be modified here.</p>
              </div>
            </div>
          )}

          {/* Test Email Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleTestEmail}
              disabled={isTesting || !isConfigured}
              variant="gradient"
              className="w-full sm:w-auto"
            >
              {isTesting ? "Sending..." : "Send Test Email"}
            </Button>
            
            {!isConfigured && (
              <p className="text-sm text-muted-foreground py-2">
                Configure environment variables and restart the application to enable email functionality.
              </p>
            )}
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
