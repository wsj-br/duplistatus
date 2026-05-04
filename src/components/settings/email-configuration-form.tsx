"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Trash2, Loader2, KeyRound, XCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { useConfiguration } from '@/contexts/configuration-context';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ConnectionType = 'plain' | 'starttls' | 'ssl';

interface EmailConfig {
  host: string;
  port: number;
  connectionType: ConnectionType;
  username: string;
  password?: string;
  mailto: string;
  senderName?: string;
  fromAddress?: string;
  requireAuth?: boolean;
  enabled: boolean;
  hasPassword?: boolean;
}

export function EmailConfigurationForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { config, refreshConfigSilently } = useConfiguration();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: '',
    port: 587,
    connectionType: 'ssl',
    username: '',
    mailto: '',
    senderName: '',
    fromAddress: '',
    requireAuth: true,
    enabled: false,
    hasPassword: false
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingPassword, setIsDeletingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  // Ref to track if we're in the middle of a password operation to prevent useEffect from overwriting
  const isPasswordOperationRef = useRef(false);

  // Load email configuration from unified config
  useEffect(() => {
    // Don't update if we're in the middle of a password operation
    if (isPasswordOperationRef.current) {
      return;
    }
    
    if (config?.email) {
      const emailConfig = config.email;
      // Ensure connectionType is set (default to STARTTLS if missing for backward compatibility)
      setEmailConfig({
        ...emailConfig,
        connectionType: emailConfig.connectionType || 'starttls',
      });
    }
  }, [config]);

  // Handle password dialog open/close - reset form when opening, clear passwords when closing
  useEffect(() => {
    if (passwordDialogOpen) {
      // Reset form state when dialog opens
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    } else {
      // Safely clear passwords from memory when dialog closes (covers all close methods)
      // Capture current values before clearing
      const currentNewPassword = newPassword;
      const currentConfirmPassword = confirmPassword;
      const randomStr = 'x'.repeat(Math.max(currentNewPassword.length, currentConfirmPassword.length, 100));
      setNewPassword(randomStr);
      setConfirmPassword(randomStr);
      // Clear after overwrite
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
      }, 0);
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordDialogOpen]);

  // Copy new password to confirm password when hiding password
  const prevShowPasswordRef = useRef(showPassword);
  useEffect(() => {
    // When password visibility changes from shown to hidden, copy new password to confirm
    if (prevShowPasswordRef.current === true && showPassword === false && newPassword) {
      setConfirmPassword(newPassword);
    }
    prevShowPasswordRef.current = showPassword;
  }, [showPassword, newPassword]);

  const handleInputChange = (field: keyof EmailConfig, value: string | number | boolean) => {
    setEmailConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to validate email format (must contain '@')
  const isValidEmail = (email: string): boolean => {
    return email.trim() !== '' && email.includes('@');
  };

  // Check if all required fields are filled (excluding password)
  const isFormValid = () => {
    const baseValid = emailConfig.host.trim() !== '' &&
                      isValidEmail(emailConfig.mailto) &&
                      emailConfig.port > 0;
    
    // Validate fromAddress if provided (must contain '@')
    if (emailConfig.fromAddress && emailConfig.fromAddress.trim() !== '') {
      if (!isValidEmail(emailConfig.fromAddress)) {
        return false;
      }
    }
    
    // If authentication is required, username and password are required
    if (emailConfig.requireAuth !== false) {
      return baseValid &&
             emailConfig.username.trim() !== '' &&
             emailConfig.hasPassword;
    }
    
    // If authentication is not required, fromAddress is required
    return baseValid &&
           emailConfig.fromAddress &&
           emailConfig.fromAddress.trim() !== '' &&
           isValidEmail(emailConfig.fromAddress);
  };

  // Get list of missing required fields
  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    
    if (emailConfig.host.trim() === '') {
      missing.push(t("SMTP Server Hostname"));
    }
    
    if (emailConfig.port <= 0) {
      missing.push(t("SMTP Server Port"));
    }
    
    if (!isValidEmail(emailConfig.mailto)) {
      missing.push(t("Recipient Email"));
    }
    
    // If authentication is required, check username and password
    if (emailConfig.requireAuth !== false) {
      if (emailConfig.username.trim() === '') {
        missing.push(t("SMTP Server Username"));
      }
      if (!emailConfig.hasPassword) {
        missing.push(t("SMTP Server Password"));
      }
    } else {
      // If authentication is not required, fromAddress is required
      if (!emailConfig.fromAddress || emailConfig.fromAddress.trim() === '' || !isValidEmail(emailConfig.fromAddress)) {
        missing.push(t("From Address"));
      }
    }
    
    return missing;
  };

  const handleSaveConfig = async () => {
    // Validate email formats before saving (but don't prevent saving)
    if (emailConfig.mailto && emailConfig.mailto.trim() !== '' && !isValidEmail(emailConfig.mailto)) {
      toast({
        title: t("Warning"),
        description: t("Recipient email format may be invalid (must contain '@' symbol). Configuration will be saved anyway."),
        variant: "default",
        duration: 3000,
      });
    }

    // If authentication is not required, fromAddress is required
    if (emailConfig.requireAuth === false) {
      if (emailConfig.fromAddress && emailConfig.fromAddress.trim() !== '' && !isValidEmail(emailConfig.fromAddress)) {
        toast({
          title: t("Warning"),
          description: t("From address format may be invalid (must contain '@' symbol). Configuration will be saved anyway."),
          variant: "default",
          duration: 3000,
        });
      }
    } else if (emailConfig.fromAddress && emailConfig.fromAddress.trim() !== '' && !isValidEmail(emailConfig.fromAddress)) {
      toast({
        title: t("Warning"),
        description: t("From address format may be invalid (must contain '@' symbol). Configuration will be saved anyway."),
        variant: "default",
        duration: 3000,
      });
    }

    setIsSaving(true);
    try {
      // Create config with username to allow clearing it
      // Password is NOT included here - it's managed separately via PATCH endpoint
      const connectionType = emailConfig.connectionType || 'starttls';
      const configToSave = {
        host: emailConfig.host,
        port: emailConfig.port,
        connectionType,
        username: emailConfig.username || '', // Send empty string to allow clearing
        // password is intentionally omitted - it's managed separately via /api/configuration/email/password
        mailto: emailConfig.mailto,
        senderName: emailConfig.senderName || undefined,
        fromAddress: emailConfig.fromAddress || undefined,
        requireAuth: emailConfig.requireAuth !== false // Default to true if not set
      };

      const response = await authenticatedRequestWithRecovery('/api/configuration/email', {
        method: 'POST',
        body: JSON.stringify(configToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      toast({
        title: t("Settings Saved"),
        description: t("SMTP settings saved successfully!"),
        duration: 2000,
      });
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
    } catch (error) {
      console.error('Error saving configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Save Failed"),
        description: error instanceof Error ? error.message : t("Failed to save configuration"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    // First validate the form
    if (!isValidEmail(emailConfig.mailto)) {
      toast({
        title: t("Validation Error"),
        description: t("Recipient email must contain '@' symbol"),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // If authentication is not required, fromAddress is required
    if (emailConfig.requireAuth === false) {
      if (!emailConfig.fromAddress || emailConfig.fromAddress.trim() === '' || !isValidEmail(emailConfig.fromAddress)) {
        toast({
          title: t("Validation Error"),
          description: t("From address is required when authentication is disabled and must contain '@' symbol"),
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
    } else if (emailConfig.fromAddress && emailConfig.fromAddress.trim() !== '' && !isValidEmail(emailConfig.fromAddress)) {
      toast({
        title: t("Validation Error"),
        description: t("From address must contain '@' symbol"),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsTesting(true);
    try {
      // First save the current configuration
      // Password is NOT included here - it's managed separately via PATCH endpoint
      const connectionType = emailConfig.connectionType || 'starttls';
      const configToSave = {
        host: emailConfig.host,
        port: emailConfig.port,
        connectionType,
        username: emailConfig.username,
        // password is intentionally omitted - it's managed separately via /api/configuration/email/password
        mailto: emailConfig.mailto,
        senderName: emailConfig.senderName || undefined,
        fromAddress: emailConfig.fromAddress || undefined,
        requireAuth: emailConfig.requireAuth !== false // Default to true if not set
      };

      const saveResponse = await authenticatedRequestWithRecovery('/api/configuration/email', {
        method: 'POST',
        body: JSON.stringify(configToSave),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      // Refresh the configuration cache to ensure test uses latest settings
      await refreshConfigSilently();

      // Now send the test email
      const response = await authenticatedRequestWithRecovery('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ 
          type: 'email',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for master key error
        if (errorData.masterKeyInvalid || (errorData.error && errorData.error.includes('Master key is invalid'))) {
          toast({
            title: t("Master Key Invalid"),
            description: t("The master key is no longer valid. All encrypted passwords and settings must be reconfigured."),
            variant: "destructive",
            duration: 8000,
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to send test email');
      }

      toast({
        title: t("Test Email Sent"),
        description: t("Settings saved and test email sent successfully! Check your inbox."),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sending test email:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Test Email Failed"),
        description: error instanceof Error ? error.message : t("Failed to send test email"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteConfig = async () => {
    setIsDeleting(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/email', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete configuration');
      }

      // Reset form to default values
      setEmailConfig({
        host: '',
        port: 587,
        connectionType: 'ssl',
        username: '',
        mailto: '',
        senderName: '',
        fromAddress: '',
        requireAuth: true,
        enabled: false,
        hasPassword: false
      });

      toast({
        title: t("Settings Deleted"),
        description: t("SMTP settings have been deleted successfully."),
        duration: 2000,
      });
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
    } catch (error) {
      console.error('Error deleting configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Delete Failed"),
        description: error instanceof Error ? error.message : t("Failed to delete configuration"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to save current configuration silently
  const saveCurrentConfigSilently = async (): Promise<boolean> => {
    try {
      const connectionType = emailConfig.connectionType || 'starttls';
      const configToSave = {
        host: emailConfig.host,
        port: emailConfig.port,
        connectionType,
        username: emailConfig.username,
        // password is intentionally omitted - it's managed separately via /api/configuration/email/password
        mailto: emailConfig.mailto,
        senderName: emailConfig.senderName || undefined,
        fromAddress: emailConfig.fromAddress || undefined,
        requireAuth: emailConfig.requireAuth !== false // Default to true if not set
      };

      const response = await authenticatedRequestWithRecovery('/api/configuration/email', {
        method: 'POST',
        body: JSON.stringify(configToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saving configuration:', errorData.error || 'Failed to save configuration');
        return false;
      }

      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
      return true;
    } catch (error) {
      console.error('Error saving configuration:', error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const handlePasswordButtonClick = async () => {
    // Save current configuration before opening password dialog to preserve unsaved changes
    const saved = await saveCurrentConfigSilently();
    if (!saved) {
      toast({
        title: t("Warning"),
        description: t("Failed to save current configuration. Your changes may be lost when changing password."),
        variant: "default",
        duration: 3000,
      });
    }
    
    setPasswordDialogOpen(true);
    // Form reset is handled by useEffect watching passwordDialogOpen
  };

  const handlePasswordSave = async () => {
    // When password is visible, confirmation field is synced, so only check newPassword
    if (!newPassword || (!showPassword && !confirmPassword)) {
      toast({
        title: t("Error"),
        description: t("Please enter both password fields"),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // When password is visible, confirmation is synced, so they match
    if (!showPassword && newPassword !== confirmPassword) {
      toast({
        title: t("Error"),
        description: t("Passwords do not match"),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSavingPassword(true);
    isPasswordOperationRef.current = true;
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/email/password', {
        method: 'PATCH',
        body: JSON.stringify({ 
          password: newPassword,
          config: {
            host: emailConfig.host,
            port: emailConfig.port,
            connectionType: emailConfig.connectionType || 'starttls',
            username: emailConfig.username,
            mailto: emailConfig.mailto,
            senderName: emailConfig.senderName || undefined,
            fromAddress: emailConfig.fromAddress || undefined,
            requireAuth: emailConfig.requireAuth !== false
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: t("Success"),
          description: t("Email password updated successfully"),
          duration: 3000,
        });
        setPasswordDialogOpen(false);
        // Safely clear passwords from memory
        safeClearPasswords();
        // Refresh configuration to update hasPassword status
        await refreshConfigSilently();
        // Update hasPassword in local state
        setEmailConfig(prev => ({ ...prev, hasPassword: true }));
      } else {
        toast({
          title: t("Error"),
          description: result.error || t("Failed to update password"),
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: error instanceof Error ? error.message : t("Failed to update password"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSavingPassword(false);
      // Reset flag after a short delay to allow refreshConfigSilently to complete
      setTimeout(() => {
        isPasswordOperationRef.current = false;
      }, 100);
    }
  };

  const handlePasswordDelete = async () => {
    setIsDeletingPassword(true);
    isPasswordOperationRef.current = true;
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/email/password', {
        method: 'PATCH',
        body: JSON.stringify({ 
          password: '',
          config: {
            host: emailConfig.host,
            port: emailConfig.port,
            connectionType: emailConfig.connectionType || 'starttls',
            username: emailConfig.username,
            mailto: emailConfig.mailto,
            senderName: emailConfig.senderName || undefined,
            fromAddress: emailConfig.fromAddress || undefined,
            requireAuth: emailConfig.requireAuth !== false
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: t("Success"),
          description: t("Email password deleted successfully"),
          duration: 3000,
        });
        setPasswordDialogOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        // Refresh configuration to update hasPassword status
        await refreshConfigSilently();
        // Update hasPassword in local state
        setEmailConfig(prev => ({ ...prev, hasPassword: false }));
      } else {
        toast({
          title: t("Error"),
          description: result.error || t("Failed to delete password"),
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: error instanceof Error ? error.message : t("Failed to delete password"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeletingPassword(false);
      // Reset flag after a short delay to allow refreshConfigSilently to complete
      setTimeout(() => {
        isPasswordOperationRef.current = false;
      }, 100);
    }
  };

  // Safely clear password fields by overwriting before clearing
  const safeClearPasswords = () => {
    // Overwrite with random characters to clear from memory
    const randomStr = 'x'.repeat(Math.max(newPassword.length, confirmPassword.length, 100));
    setNewPassword(randomStr);
    setConfirmPassword(randomStr);
    // Clear after overwrite
    setTimeout(() => {
      setNewPassword('');
      setConfirmPassword('');
    }, 0);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    // Password clearing is handled by useEffect watching passwordDialogOpen
  };


  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t("Email Settings")}
          </CardTitle>
          <CardDescription>
            {t("Configure SMTP settings for email notifications. Settings are stored securely in the database.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Notice */}
          {!isFormValid() && (
            <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 flex items-start gap-6 [&>svg]:relative [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-3.5" />
              <AlertDescription className="text-white-800 dark:text-white-200">
              <b>{t("Email notifications are disabled.")}</b> {t("Complete the required fields below to enable notifications.")}
              <br /><br />
              <b>{t("Important:")}</b> {t("Always test your settings to ensure emails are delivered successfully.")}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Configuration Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">
                  {t("SMTP Server Hostname")}
                  {emailConfig.host.trim() === '' && <span className="text-red-500 ml-1">{t("(required)")}</span>}
                </Label>
                <Input
                  id="smtp-host"
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder={t("smtp.your-domain.com")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-port">
                  {t("SMTP Server Port")}
                  {emailConfig.port <= 0 && <span className="text-red-500 ml-1">{t("(required)")}</span>}
                </Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                  placeholder={t("587")}
                  min="1"
                  max="65535"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">
                  {t("SMTP Server Username")}
                  {emailConfig.requireAuth !== false && emailConfig.username.trim() === '' && <span className="text-red-500 ml-1">{t("(required)")}</span>}
                </Label>
                <Input
                  id="smtp-username"
                  type="text"
                  value={emailConfig.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder={t("your-email@your-domain.com")}
                  disabled={emailConfig.requireAuth === false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">
                  {t("SMTP Server Password")}
                  {emailConfig.requireAuth !== false && !emailConfig.hasPassword && <span className="text-red-500 ml-1">{t("(required)")}</span>}
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePasswordButtonClick}
                    disabled={emailConfig.username.trim() === '' || emailConfig.requireAuth === false}
                    className="flex items-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    {emailConfig.hasPassword ? t("Change Password") : t("Set Password")}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtp-require-auth"
                      checked={emailConfig.requireAuth !== false}
                      onCheckedChange={(checked) => handleInputChange('requireAuth', checked)}
                    />
                    <Label htmlFor="smtp-require-auth" className="text-sm">
                      {t("SMTP Server requires authentication")}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-mailto">
                  {t("Recipient Email")}
                  {!isValidEmail(emailConfig.mailto) && <span className="text-red-500 ml-1">{t("(required)")}</span>}
                </Label>
                <Input
                  id="smtp-mailto"
                  type="email"
                  value={emailConfig.mailto}
                  onChange={(e) => handleInputChange('mailto', e.target.value)}
                  placeholder={t("recipient@example.com")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-connection-type">{t("Connection Type")}</Label>
                <div className="flex rounded-md border border-input bg-background shadow-sm w-fit" role="group">
                  <button
                    type="button"
                    id="smtp-connection-type-plain"
                    onClick={() => handleInputChange('connectionType', 'plain')}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-l-md border-r border-input
                      transition-colors focus:outline-none focus:ring-0
                      ${emailConfig.connectionType === 'plain'
                        ? 'bg-blue-600 text-white'
                        : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    {t("Plain SMTP")}
                  </button>
                  <button
                    type="button"
                    id="smtp-connection-type-starttls"
                    onClick={() => handleInputChange('connectionType', 'starttls')}
                    className={`
                      px-4 py-2 text-sm font-medium border-r border-input
                      transition-colors focus:outline-none focus:ring-0
                      ${emailConfig.connectionType === 'starttls'
                        ? 'bg-blue-600 text-white'
                        : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    {t("STARTTLS")}
                  </button>
                  <button
                    type="button"
                    id="smtp-connection-type-ssl"
                    onClick={() => handleInputChange('connectionType', 'ssl')}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-r-md
                      transition-colors focus:outline-none focus:ring-0
                      ${emailConfig.connectionType === 'ssl'
                        ? 'bg-blue-600 text-white'
                        : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    {t("Direct SSL/TLS")}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailConfig.connectionType === 'plain'
                    ? t("Plain SMTP connection without encryption (not recommended, use only for trusted networks).")
                    : emailConfig.connectionType === 'starttls'
                    ? t("STARTTLS connection (recommended for port 587). The connection will upgrade to TLS after initial handshake.")
                    : t("Direct SSL/TLS connection (recommended for port 465). The connection is encrypted from the start.")
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-sender-name">{t("Sender Name (optional)")}</Label>
                <Input
                  id="smtp-sender-name"
                  type="text"
                  value={emailConfig.senderName || ''}
                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                  placeholder={t("duplistatus")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("Display name shown as the sender. Defaults to \"duplistatus\" if not set.")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-from-address">
                  {t("From Address")}{' '}
                  {emailConfig.requireAuth === false ? (
                    <span className="text-red-500">{t("(required)")}</span>
                  ) : (
                    <span>{t("(optional)")}</span>
                  )}
                </Label>
                <Input
                  id="smtp-from-address"
                  type="email"
                  value={emailConfig.fromAddress || ''}
                  onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                  placeholder={t("noreply@your-domain.com")}
                  required={emailConfig.requireAuth === false}
                />
                <p className="text-xs text-muted-foreground">
                  {emailConfig.requireAuth === false ? (
                    <>
                      {t("Email address shown as the sender. Required when authentication is disabled.")}
                    </>
                  ) : (
                    <>
                      {t("Email address shown as the sender. Defaults to SMTP Server Username if not set. Note: Some email providers (like Gmail) will always use the SMTP Server Username instead of this value.")}
                    </>
                  )}
                </p>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? t("Saving...") : t("Save Settings")}
            </Button>
            
            <Button
              onClick={handleTestEmail}
              disabled={isTesting || !isFormValid()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("Sending...")}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {t("Send Test Email")}
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? t("Deleting...") : t("Delete SMTP Settings")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Delete SMTP Settings")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("Are you sure you want to delete the SMTP settings? This action cannot be undone and will remove all email notification settings.")}
                </AlertDialogDescription>
              </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfig}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t("Delete Settings")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={handlePasswordDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("Change Email Password")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                {t("New Password")}
              </Label>
              <TogglePasswordInput
                ref={passwordInputRef}
                id="new-password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder={t("Enter new password")}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className={`text-sm font-medium ${showPassword ? 'opacity-60' : ''}`}>
                {t("Confirm Password")}
              </Label>
              <TogglePasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder={t("Confirm new password")}
                className={!showPassword && newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                isConfirmation={true}
                syncValue={newPassword}
                passwordInputRef={passwordInputRef}
              />
              {!showPassword && newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {t("Passwords do not match")}
                </p>
              )}
            </div>
            
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="destructive"
                onClick={handlePasswordDelete}
                disabled={isDeletingPassword || isSavingPassword}
              >
                {isDeletingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Deleting...")}
                  </>
                ) : (
                  <>{t("Delete Password")}</>
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasswordDialogClose}
                  disabled={isSavingPassword || isDeletingPassword}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handlePasswordSave}
                  disabled={isSavingPassword || isDeletingPassword || !newPassword || (!showPassword && (!confirmPassword || newPassword !== confirmPassword))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Saving...")}
                    </>
                  ) : (
                    <>{t("Save Password")}</>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
