"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Eye, EyeOff, Trash2, Loader2, KeyRound, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { authenticatedRequest } from '@/lib/client-session-csrf';
import { useConfiguration } from '@/contexts/configuration-context';
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

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  mailto: string;
  enabled: boolean;
  hasPassword?: boolean;
}

export function EmailConfigurationForm() {
  const { toast } = useToast();
  const { config, refreshConfigSilently } = useConfiguration();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: '',
    port: 587,
    secure: false,
    username: '',
    mailto: '',
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load email configuration from unified config
  useEffect(() => {
    if (config?.email) {
      setEmailConfig(config.email);
    }
  }, [config]);

  const handleInputChange = (field: keyof EmailConfig, value: string | number | boolean) => {
    setEmailConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if all required fields are filled (excluding secure toggle and password)
  const isFormValid = () => {
    return emailConfig.host.trim() !== '' &&
           emailConfig.username.trim() !== '' &&
           emailConfig.mailto.trim() !== '' &&
           emailConfig.port > 0 &&
           emailConfig.hasPassword;
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // Create config without password for saving
      const configToSave = {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        username: emailConfig.username,
        password: '', // Password is managed separately
        mailto: emailConfig.mailto
      };

      const response = await authenticatedRequest('/api/configuration/email', {
        method: 'POST',
        body: JSON.stringify(configToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      toast({
        title: "Settings Saved",
        description: "SMTP settings saved successfully!",
        duration: 2000,
      });
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
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

  const handleDeleteConfig = async () => {
    setIsDeleting(true);
    try {
      const response = await authenticatedRequest('/api/configuration/email', {
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
        secure: false,
        username: '',
        mailto: '',
        enabled: false,
        hasPassword: false
      });

      toast({
        title: "Settings Deleted",
        description: "SMTP settings have been deleted successfully.",
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

  const handlePasswordButtonClick = () => {
    setPasswordDialogOpen(true);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordSave = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter both password fields",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await authenticatedRequest('/api/configuration/email/password', {
        method: 'PATCH',
        body: JSON.stringify({ 
          password: newPassword,
          config: {
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            username: emailConfig.username,
            mailto: emailConfig.mailto
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
        setNewPassword('');
        setConfirmPassword('');
        // Refresh configuration to update hasPassword status
        await refreshConfigSilently();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePasswordDelete = async () => {
    setIsDeletingPassword(true);
    try {
      const response = await authenticatedRequest('/api/configuration/email/password', {
        method: 'PATCH',
        body: JSON.stringify({ 
          password: '',
          config: {
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            username: emailConfig.username,
            mailto: emailConfig.mailto
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
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete password",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete password",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeletingPassword(false);
    }
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Settings
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
                <Label htmlFor="smtp-host">SMTP Server Hostname</Label>
                <Input
                  id="smtp-host"
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Server Port</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">SMTP Server Username</Label>
                <Input
                  id="smtp-username"
                  type="text"
                  value={emailConfig.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Server Password</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePasswordButtonClick}
                    className="flex items-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    {emailConfig.hasPassword ? 'Change Password' : 'Set Password'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="smtp-secure">Connection Security</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="smtp-secure"
                    checked={emailConfig.secure}
                    onCheckedChange={(checked) => handleInputChange('secure', checked)}
                  />
                  <Label htmlFor="smtp-secure" className="text-sm">
                    Use secure connection (SSL/TLS)
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailConfig.secure
                    ? 'A secure connection will be used: Direct SSL/TLS (recommended for port 465).'
                    : 'A secure connection will be used: STARTTLS (recommended for port 587).'}
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
              {isSaving ? "Saving..." : "Save Settings"}
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
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Test Email
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
                  {isDeleting ? "Deleting..." : "Delete SMTP Settings"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete SMTP Settings</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the SMTP settings? This action cannot be undone and will remove all email notification settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfig}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Settings
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
            <DialogTitle>Change Email Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full pr-10 ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Passwords do not match
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
                    Deleting...
                  </>
                ) : (
                  'Delete Password'
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasswordDialogClose}
                  disabled={isSavingPassword || isDeletingPassword}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handlePasswordSave}
                  disabled={isSavingPassword || isDeletingPassword || !newPassword || !confirmPassword || Boolean(newPassword && confirmPassword && newPassword !== confirmPassword)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Password'
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
