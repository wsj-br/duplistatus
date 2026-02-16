"use client";

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
import { useIntlayer } from 'react-intlayer';
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
  const content = useIntlayer('email-configuration-form');
  const common = useIntlayer('common');
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
      missing.push(content.smtpServerHostnameMissing);
    }
    
    if (emailConfig.port <= 0) {
      missing.push(content.smtpServerPortMissing);
    }
    
    if (!isValidEmail(emailConfig.mailto)) {
      missing.push(content.recipientEmailMissing);
    }
    
    // If authentication is required, check username and password
    if (emailConfig.requireAuth !== false) {
      if (emailConfig.username.trim() === '') {
        missing.push(content.smtpServerUsernameMissing);
      }
      if (!emailConfig.hasPassword) {
        missing.push(content.smtpServerPasswordMissing);
      }
    } else {
      // If authentication is not required, fromAddress is required
      if (!emailConfig.fromAddress || emailConfig.fromAddress.trim() === '' || !isValidEmail(emailConfig.fromAddress)) {
        missing.push(content.fromAddressMissing);
      }
    }
    
    return missing;
  };

  const handleSaveConfig = async () => {
    // Validate email formats before saving (but don't prevent saving)
    if (emailConfig.mailto && emailConfig.mailto.trim() !== '' && !isValidEmail(emailConfig.mailto)) {
      toast({
        title: "Warning",
        description: "Recipient email format may be invalid (must contain '@' symbol). Configuration will be saved anyway.",
        variant: "default",
        duration: 3000,
      });
    }

    // If authentication is not required, fromAddress is required
    if (emailConfig.requireAuth === false) {
      if (emailConfig.fromAddress && emailConfig.fromAddress.trim() !== '' && !isValidEmail(emailConfig.fromAddress)) {
        toast({
          title: "Warning",
          description: "From address format may be invalid (must contain '@' symbol). Configuration will be saved anyway.",
          variant: "default",
          duration: 3000,
        });
      }
    } else if (emailConfig.fromAddress && emailConfig.fromAddress.trim() !== '' && !isValidEmail(emailConfig.fromAddress)) {
      toast({
        title: "Warning",
        description: "From address format may be invalid (must contain '@' symbol). Configuration will be saved anyway.",
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
        title: content.settingsSaved,
        description: content.smtpSettingsSavedSuccessfully,
        duration: 2000,
      });
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
    } catch (error) {
      console.error('Error saving configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: content.saveFailed,
        description: error instanceof Error ? error.message : content.failedToSaveConfiguration,
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
        title: content.validationError,
        description: content.recipientEmailMustContainAt,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // If authentication is not required, fromAddress is required
    if (emailConfig.requireAuth === false) {
      if (!emailConfig.fromAddress || emailConfig.fromAddress.trim() === '' || !isValidEmail(emailConfig.fromAddress)) {
        toast({
          title: content.validationError,
          description: content.fromAddressRequiredWhenAuthDisabled,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
    } else if (emailConfig.fromAddress && emailConfig.fromAddress.trim() !== '' && !isValidEmail(emailConfig.fromAddress)) {
      toast({
        title: content.validationError,
        description: content.fromAddressMustContainAt,
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
            title: "Master Key Invalid",
            description: "The master key is no longer valid. All encrypted passwords and settings must be reconfigured.",
            variant: "destructive",
            duration: 8000,
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to send test email');
      }

      toast({
        title: "Test Email Sent",
        description: "Settings saved and test email sent successfully! Check your inbox.",
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
        title: content.settingsDeleted,
        description: content.smtpSettingsDeletedSuccessfully,
        duration: 2000,
      });
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
    } catch (error) {
      console.error('Error deleting configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete configuration",
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
        title: content.warning,
        description: content.failedToSaveCurrentConfiguration,
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
        title: common.status.error,
        description: content.pleaseEnterBothPasswordFields,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // When password is visible, confirmation is synced, so they match
    if (!showPassword && newPassword !== confirmPassword) {
      toast({
        title: common.status.error,
        description: content.passwordsDoNotMatch,
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
          title: "Success",
          description: "Email password updated successfully",
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
          title: common.status.error,
          description: result.error || content.failedToUpdatePassword,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: common.status.error,
        description: error instanceof Error ? error.message : content.failedToUpdatePassword,
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
          title: "Success",
          description: "Email password deleted successfully",
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
          title: common.status.error,
          description: result.error || content.failedToDeletePassword,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: common.status.error,
        description: error instanceof Error ? error.message : content.failedToDeletePassword,
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
            {content.emailSettings}
          </CardTitle>
          <CardDescription>
            {content.descriptionFull}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Notice */}
          {!isFormValid() && (
            <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 flex items-start gap-6 [&>svg]:relative [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-3.5" />
              <AlertDescription className="text-white-800 dark:text-white-200">
              <b>{content.emailNotificationsDisabled}</b> {content.completeRequiredFields}
              <br /><br />
              <b>{content.important}</b> {content.alwaysTestSettings}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Configuration Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">
                  {content.smtpServerHostname}
                  {emailConfig.host.trim() === '' && <span className="text-red-500 ml-1">{content.required}</span>}
                </Label>
                <Input
                  id="smtp-host"
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder={content.smtpHostPlaceholder.value}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-port">
                  {content.smtpServerPort}
                  {emailConfig.port <= 0 && <span className="text-red-500 ml-1">{content.required}</span>}
                </Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                  placeholder={content.smtpPortPlaceholder.value}
                  min="1"
                  max="65535"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">
                  {content.smtpServerUsername}
                  {emailConfig.requireAuth !== false && emailConfig.username.trim() === '' && <span className="text-red-500 ml-1">{content.required}</span>}
                </Label>
                <Input
                  id="smtp-username"
                  type="text"
                  value={emailConfig.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder={content.smtpUsernamePlaceholder.value}
                  disabled={emailConfig.requireAuth === false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">
                  {content.smtpServerPassword}
                  {emailConfig.requireAuth !== false && !emailConfig.hasPassword && <span className="text-red-500 ml-1">{content.required}</span>}
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
                    {emailConfig.hasPassword ? content.changePassword : content.setPassword}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtp-require-auth"
                      checked={emailConfig.requireAuth !== false}
                      onCheckedChange={(checked) => handleInputChange('requireAuth', checked)}
                    />
                    <Label htmlFor="smtp-require-auth" className="text-sm">
                      {content.smtpRequiresAuth}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-mailto">
                  {content.recipientEmail}
                  {!isValidEmail(emailConfig.mailto) && <span className="text-red-500 ml-1">{content.required}</span>}
                </Label>
                <Input
                  id="smtp-mailto"
                  type="email"
                  value={emailConfig.mailto}
                  onChange={(e) => handleInputChange('mailto', e.target.value)}
                  placeholder={content.recipientEmailPlaceholder.value}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-connection-type">{content.connectionType}</Label>
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
                    {content.plainSmtp}
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
                    {content.starttls}
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
                    {content.directSslTls}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailConfig.connectionType === 'plain'
                    ? content.plainSmtpDescription
                    : emailConfig.connectionType === 'starttls'
                    ? content.starttlsDescription
                    : content.directSslTlsDescription
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-sender-name">{content.senderNameOptional}</Label>
                <Input
                  id="smtp-sender-name"
                  type="text"
                  value={emailConfig.senderName || ''}
                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                  placeholder={content.senderNamePlaceholder.value}
                />
                <p className="text-xs text-muted-foreground">
                  {content.senderNameDescription}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-from-address">
                  {content.fromAddressLabel}{' '}
                  {emailConfig.requireAuth === false ? (
                    <span className="text-red-500">{content.required}</span>
                  ) : (
                    <span>{content.optional}</span>
                  )}
                </Label>
                <Input
                  id="smtp-from-address"
                  type="email"
                  value={emailConfig.fromAddress || ''}
                  onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                  placeholder={content.fromAddressPlaceholder.value}
                  required={emailConfig.requireAuth === false}
                />
                <p className="text-xs text-muted-foreground">
                  {emailConfig.requireAuth === false ? (
                    <>
                      {content.fromAddressRequiredDescription}
                    </>
                  ) : (
                    <>
                      {content.fromAddressOptionalDescription}
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
              {isSaving ? content.saving : content.saveSettings}
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
                  {content.sending}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {content.sendTestEmail}
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
                  {isDeleting ? content.deleting : content.deleteSmtpSettings}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{content.deleteSmtpSettingsTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {content.deleteSmtpSettingsDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{common.ui.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfig}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {content.deleteSettings}
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
            <DialogTitle>{content.changeEmailPassword}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                {content.newPassword}
              </Label>
              <TogglePasswordInput
                ref={passwordInputRef}
                id="new-password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder={content.enterNewPassword.value}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className={`text-sm font-medium ${showPassword ? 'opacity-60' : ''}`}>
                {content.confirmPassword}
              </Label>
              <TogglePasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder={content.confirmNewPassword.value}
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
                  {content.passwordsDoNotMatch}
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
                    {content.deleting}
                  </>
                ) : (
                  content.deletePassword
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasswordDialogClose}
                  disabled={isSavingPassword || isDeletingPassword}
                >
                  {common.ui.cancel}
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
                      {content.saving}
                    </>
                  ) : (
                    content.savePassword
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
