'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/components/ui/use-toast';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, KeyRound, Search, Copy, Check, X, UserCog } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { usePasswordPolicy } from '@/hooks/use-password-policy';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  isLocked: boolean;
}

interface UserManagementFormProps {
  currentUserId?: string;
}

export function UserManagementForm({ currentUserId }: UserManagementFormProps) {
  const { toast } = useToast();
  const passwordPolicy = usePasswordPolicy();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'username', direction: 'asc' });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Form state
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIsAdmin, setFormIsAdmin] = useState(false);
  const [formRequirePasswordChange, setFormRequirePasswordChange] = useState(true);
  const [formAutoGeneratePassword, setFormAutoGeneratePassword] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Load users - wrapped in useCallback to avoid recreating on each render
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authenticatedRequestWithRecovery('/api/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered users
  const sortedUsers = useMemo(() => {
    // Column configuration for sorting
    const columnConfig = {
      username: { type: 'text' as keyof typeof sortFunctions, path: 'username' },
      isAdmin: { type: 'boolean' as keyof typeof sortFunctions, path: 'isAdmin' },
      isLocked: { type: 'boolean' as keyof typeof sortFunctions, path: 'isLocked' },
      mustChangePassword: { type: 'boolean' as keyof typeof sortFunctions, path: 'mustChangePassword' },
      lastLoginAt: { type: 'date' as keyof typeof sortFunctions, path: 'lastLoginAt' },
      createdAt: { type: 'date' as keyof typeof sortFunctions, path: 'createdAt' },
      updatedAt: { type: 'date' as keyof typeof sortFunctions, path: 'updatedAt' },
    };
    return createSortedArray(filteredUsers, sortConfig, columnConfig);
  }, [filteredUsers, sortConfig]);

  // Check if a specific user is the last admin
  const isUserLastAdmin = useCallback((userId: string) => {
    const adminUsers = users.filter(u => u.isAdmin);
    return adminUsers.length === 1 && adminUsers[0].id === userId;
  }, [users]);

  // Handle sort
  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      // For date columns, default to descending (newer first)
      const dateColumns = ['lastLoginAt', 'createdAt', 'updatedAt'];
      return {
        column,
        direction: dateColumns.includes(column) ? 'desc' : 'asc',
      };
    });
  };

  // Real-time password validation for create form
  const passwordRequirements = useMemo(() => {
    if (formAutoGeneratePassword) {
      return {
        minLength: true,
        hasUppercase: true,
        hasLowercase: true,
        hasNumber: true,
      };
    }
    
    // Use policy if available, otherwise fallback to defaults
    const minLength = passwordPolicy?.minLength ?? 8;
    const requireUppercase = passwordPolicy?.requireUppercase ?? true;
    const requireLowercase = passwordPolicy?.requireLowercase ?? true;
    const requireNumbers = passwordPolicy?.requireNumbers ?? true;
    
    return {
      minLength: formPassword.length >= minLength,
      hasUppercase: !requireUppercase || /[A-Z]/.test(formPassword),
      hasLowercase: !requireLowercase || /[a-z]/.test(formPassword),
      hasNumber: !requireNumbers || /[0-9]/.test(formPassword),
    };
  }, [formPassword, formAutoGeneratePassword, passwordPolicy]);

  const isPasswordValid = useMemo(() => {
    if (formAutoGeneratePassword) return true;
    if (!passwordPolicy) {
      // Wait for policy to load
      return false;
    }
    return (
      passwordRequirements.minLength &&
      passwordRequirements.hasUppercase &&
      passwordRequirements.hasLowercase &&
      passwordRequirements.hasNumber
    );
  }, [passwordRequirements, formAutoGeneratePassword, passwordPolicy]);

  // Requirement item component (defined inside to avoid recreation warnings)
  const RequirementItem = useCallback(({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  ), []);

  // Check if form is valid for submission
  const isCreateFormValid = useMemo(() => {
    if (!formUsername.trim()) return false;
    if (!formAutoGeneratePassword && !isPasswordValid) return false;
    return true;
  }, [formUsername, formAutoGeneratePassword, isPasswordValid]);

  // Handle create user
  const handleCreate = async () => {
    if (!formUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formAutoGeneratePassword && !formPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Password is required when not auto-generating',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          username: formUsername.trim(),
          password: formAutoGeneratePassword ? undefined : formPassword,
          isAdmin: formIsAdmin,
          requirePasswordChange: formRequirePasswordChange,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      const data = await response.json();
      
      // Show temporary password if generated
      if (data.temporaryPassword) {
        setTempPassword(data.temporaryPassword);
        setPasswordResetDialogOpen(true);
      } else {
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        setCreateDialogOpen(false);
        resetForm();
        loadUsers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update user
  const handleUpdate = async () => {
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      const response = await authenticatedRequestWithRecovery(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          username: formUsername.trim() !== selectedUser.username ? formUsername.trim() : undefined,
          isAdmin: formIsAdmin !== selectedUser.isAdmin ? formIsAdmin : undefined,
          requirePasswordChange: formRequirePasswordChange !== selectedUser.mustChangePassword ? formRequirePasswordChange : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setEditDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete user
  const handleDelete = async () => {
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      const response = await authenticatedRequestWithRecovery(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      setDeleteDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      const response = await authenticatedRequestWithRecovery(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          resetPassword: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset password');
      }

      const data = await response.json();
      setTempPassword(data.temporaryPassword);
      setPasswordResetDialogOpen(true);
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormUsername('');
    setFormPassword('');
    setFormIsAdmin(false);
    setFormRequirePasswordChange(true);
    setFormAutoGeneratePassword(true);
    setSelectedUser(null);
    setTempPassword(null);
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormUsername(user.username);
    setFormIsAdmin(user.isAdmin);
    setFormRequirePasswordChange(user.mustChangePassword);
    setFormAutoGeneratePassword(false);
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Copy password to clipboard
  const copyPassword = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={UserCog} color="blue" size="md" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions. Create, edit, or delete users and reset passwords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button variant="gradient"  onClick={() => {
              resetForm();
              setCreateDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading users...</div>
      ) : sortedUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No users found matching your search' : 'No users found'}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-md">
            <Table>
            <TableHeader className="sticky top-0 z-20 bg-muted border-b-2 border-border shadow-sm">
              <TableRow className="bg-muted">
                <SortableTableHead 
                  column="username" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                  className="bg-muted"
                >
                  Username
                </SortableTableHead>
                <SortableTableHead 
                  column="isAdmin" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                  className="bg-muted"
                >
                  Role
                </SortableTableHead>
                <SortableTableHead 
                  column="lastLoginAt" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                  className="bg-muted"
                >
                  Last Login
                </SortableTableHead>
                <SortableTableHead 
                  column="updatedAt" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                  className="bg-muted"
                >
                  Last Update
                </SortableTableHead>
                <SortableTableHead 
                  column="createdAt" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                  className="bg-muted"
                >
                  Created
                </SortableTableHead>
                <SortableTableHead 
                  column="isLocked" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                  className="bg-muted"
                >
                  Status
                </SortableTableHead>
                <TableHead className="text-right bg-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        User
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (
                      <>
                        <div>{new Date(user.lastLoginAt).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(user.lastLoginAt)}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{new Date(user.updatedAt).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(user.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{new Date(user.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isLocked ? (
                      <span className="text-red-600 dark:text-red-400">Locked</span>
                    ) : user.mustChangePassword ? (
                      <span className="text-yellow-600 dark:text-yellow-400">Must Change Password</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          handlePasswordReset();
                        }}
                        title="Reset password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(user)}
                          title={
                            isUserLastAdmin(user.id) 
                              ? "Cannot delete the last admin account" 
                              : user.isAdmin 
                              ? "Delete admin user (warning: this is an admin account)" 
                              : "Delete user"
                          }
                          className={
                            isUserLastAdmin(user.id)
                              ? "text-muted-foreground hover:text-muted-foreground cursor-not-allowed opacity-50"
                              : user.isAdmin
                              ? "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                              : "text-destructive hover:text-destructive"
                          }
                          disabled={isUserLastAdmin(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {sortedUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <CardContent className="p-0 space-y-3">
                  {/* Header with Username and Role */}
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium text-base">{user.username}</div>
                      <div className="mt-1">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                            User
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          handlePasswordReset();
                        }}
                        title="Reset password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(user)}
                          title={
                            isUserLastAdmin(user.id) 
                              ? "Cannot delete the last admin account" 
                              : user.isAdmin 
                              ? "Delete admin user (warning: this is an admin account)" 
                              : "Delete user"
                          }
                          className={
                            isUserLastAdmin(user.id)
                              ? "text-muted-foreground hover:text-muted-foreground cursor-not-allowed opacity-50"
                              : user.isAdmin
                              ? "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                              : "text-destructive hover:text-destructive"
                          }
                          disabled={isUserLastAdmin(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* User Information Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Last Login */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Last Login</Label>
                      <div className="text-sm">
                        {user.lastLoginAt ? (
                          <>
                            <div>{new Date(user.lastLoginAt).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatRelativeTime(user.lastLoginAt)}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </div>
                    </div>

                    {/* Last Update */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Last Update</Label>
                      <div className="text-sm">
                        <div>{new Date(user.updatedAt).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(user.updatedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Created */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Created</Label>
                      <div className="text-sm">
                        <div>{new Date(user.createdAt).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(user.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="text-sm">
                        {user.isLocked ? (
                          <span className="text-red-600 dark:text-red-400">Locked</span>
                        ) : user.mustChangePassword ? (
                          <span className="text-yellow-600 dark:text-yellow-400">Must Change Password</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account. You can auto-generate a secure password or set a custom one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-username">Username</Label>
              <Input
                id="create-username"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="Enter username"
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-generate"
                  checked={formAutoGeneratePassword}
                  onCheckedChange={(checked) => {
                    setFormAutoGeneratePassword(checked === true);
                    if (checked === true) {
                      setFormPassword(''); // Clear password when enabling auto-generate
                    }
                  }}
                  disabled={formLoading}
                />
                <Label htmlFor="auto-generate" className="cursor-pointer">
                  Auto-generate secure password
                </Label>
              </div>
              {!formAutoGeneratePassword && (
                <div className="space-y-2">
                  <TogglePasswordInput
                    id="create-password"
                    value={formPassword}
                    onChange={setFormPassword}
                    placeholder="Enter password"
                    disabled={formLoading}
                  />
                  <div className="space-y-2 rounded-md bg-muted p-3">
                    <div className="text-sm font-semibold mb-2">Password Requirements:</div>
                    <div className="space-y-1.5">
                      {passwordPolicy && (
                        <>
                          <RequirementItem 
                            met={passwordRequirements.minLength} 
                            label={`At least ${passwordPolicy.minLength} characters long`}
                          />
                          {passwordPolicy.requireUppercase && (
                            <RequirementItem 
                              met={passwordRequirements.hasUppercase} 
                              label="Contains at least one uppercase letter (A-Z)" 
                            />
                          )}
                          {passwordPolicy.requireLowercase && (
                            <RequirementItem 
                              met={passwordRequirements.hasLowercase} 
                              label="Contains at least one lowercase letter (a-z)" 
                            />
                          )}
                          {passwordPolicy.requireNumbers && (
                            <RequirementItem 
                              met={passwordRequirements.hasNumber} 
                              label="Contains at least one number (0-9)" 
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-is-admin"
                  checked={formIsAdmin}
                  onCheckedChange={(checked) => setFormIsAdmin(checked === true)}
                  disabled={formLoading}
                />
                <Label htmlFor="create-is-admin" className="cursor-pointer">
                  Admin user
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-require-password-change"
                  checked={formRequirePasswordChange}
                  onCheckedChange={(checked) => setFormRequirePasswordChange(checked === true)}
                  disabled={formLoading}
                />
                <Label htmlFor="create-require-password-change" className="cursor-pointer">
                  Require password change on first login
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              resetForm();
            }} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading || !isCreateFormValid}>
              {formLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Use the password reset button to change the password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="Enter username"
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is-admin"
                  checked={formIsAdmin}
                  onCheckedChange={(checked) => setFormIsAdmin(checked === true)}
                  disabled={formLoading}
                />
                <Label htmlFor="edit-is-admin" className="cursor-pointer">
                  Admin user
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-require-password-change"
                  checked={formRequirePasswordChange}
                  onCheckedChange={(checked) => setFormRequirePasswordChange(checked === true)}
                  disabled={formLoading}
                />
                <Label htmlFor="edit-require-password-change" className="cursor-pointer">
                  Require password change on next login
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              resetForm();
            }} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user <strong>{selectedUser?.username}</strong>? This action cannot be undone.
              {selectedUser?.isAdmin && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                  Warning: This is an admin user.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={formLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {formLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? `A new temporary password has been generated for ${selectedUser.username}.`
                : 'A new temporary password has been generated for the user.'}
              <br />
              <strong className="text-destructive">Copy this password now - it will not be shown again!</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {tempPassword && (
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={tempPassword}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyPassword}
                    title="Copy password"
                  >
                    {copiedPassword ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  The user will be required to change this password on first login.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setPasswordResetDialogOpen(false);
              setTempPassword(null);
              if (!selectedUser) {
                setCreateDialogOpen(false);
                resetForm();
                loadUsers();
              }
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

