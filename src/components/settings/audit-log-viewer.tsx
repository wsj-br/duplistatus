'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { Search, Download, ChevronLeft, ChevronRight, Eye, Calendar as CalendarIcon } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';

interface AuditLog {
  id: number;
  timestamp: string;
  userId: string | null;
  username: string | null;
  action: string;
  category: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  errorMessage: string | null;
}

interface AuditLogViewerProps {
  currentUserId?: string;
  isAdmin?: boolean;
}

export function AuditLogViewer({ currentUserId, isAdmin = false }: AuditLogViewerProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audit-log-page-size');
      return saved ? Number.parseInt(saved, 10) : 5;
    }
    return 5;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [username, setUsername] = useState('');
  const [action, setAction] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  // Load audit logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (username) params.append('username', username);
      if (action && action !== 'all') params.append('action', action);
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);

      const response = await authenticatedRequestWithRecovery(`/api/audit-log?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load audit logs');
      
      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, pageSize, startDate, endDate, username, action, category, status]);

  // Get unique values for filters
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach(log => actions.add(log.action));
    return Array.from(actions).sort();
  }, [logs]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    logs.forEach(log => categories.add(log.category));
    return Array.from(categories).sort();
  }, [logs]);

  // Handle download
  const handleDownload = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (username) params.append('username', username);
      if (action && action !== 'all') params.append('action', action);
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);

      const response = await authenticatedRequestWithRecovery(`/api/audit-log/download?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to download audit logs');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Audit log downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error downloading audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to download audit logs',
        variant: 'destructive',
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setUsername('');
    setAction('all');
    setCategory('all');
    setStatus('all');
    setPage(1);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">Success</Badge>;
      case 'failure':
        return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Failure</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get category badge color
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      auth: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      user: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      config: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      backup: 'bg-green-500/20 text-green-600 dark:text-green-400',
      server: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      system: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
    };
    return <Badge className={colors[category] || ''}>{category}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="border rounded-md p-4 space-y-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Filters
          </h3>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 mr-10">
              <Label htmlFor="page-size" className="text-xs text-muted-foreground whitespace-nowrap">
                Entries per page:
              </Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  const newPageSize = Number.parseInt(value, 10);
                  setPageSize(newPageSize);
                  setPage(1);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('audit-log-page-size', value);
                  }
                }}
              >
                <SelectTrigger id="page-size" className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 entries</SelectItem>
                  <SelectItem value="10">10 entries</SelectItem>
                  <SelectItem value="20">20 entries</SelectItem>
                  <SelectItem value="50">50 entries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('csv')}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('json')}>
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <DatePicker
              id="start-date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <DatePicker
              id="end-date"
              value={endDate}
              onChange={(value) => {
                setEndDate(value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={(value) => {
              setAction(value);
              setPage(1);
            }}>
              <SelectTrigger id="action">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {uniqueActions.map(act => (
                  <SelectItem key={act} value={act}>{act}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => {
              setCategory(value);
              setPage(1);
            }}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background border-b">
                <TableRow className="bg-muted/50">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>{log.username || 'System'}</TableCell>
                    <TableCell className="font-mono text-sm">{log.action}</TableCell>
                    <TableCell>{getCategoryBadge(log.category)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {log.targetType && log.targetId ? (
                        <span className="text-sm text-muted-foreground">
                          {log.targetType}: {log.targetId.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailsDialogOpen(true);
                        }}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information for audit log entry #{selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 px-6 pb-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Timestamp</Label>
                  <div className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <div className="text-sm">{selectedLog.username || 'System'}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <div>{getCategoryBadge(selectedLog.category)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Action</Label>
                  <div className="text-sm font-mono">{selectedLog.action}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">IP Address</Label>
                  <div className="text-sm">{selectedLog.ipAddress || '—'}</div>
                </div>
                {selectedLog.targetType && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Target Type</Label>
                    <div className="text-sm">{selectedLog.targetType}</div>
                  </div>
                )}
                {selectedLog.targetId && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Target ID</Label>
                    <div className="text-sm font-mono">{selectedLog.targetId}</div>
                  </div>
                )}
              </div>
              {selectedLog.userAgent && (
                <div>
                  <Label className="text-xs text-muted-foreground">User Agent</Label>
                  <div className="text-sm break-all">{selectedLog.userAgent}</div>
                </div>
              )}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Details</Label>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.errorMessage && (
                <div>
                  <Label className="text-xs text-muted-foreground">Error Message</Label>
                  <div className="text-sm text-red-600 dark:text-red-400 break-all">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

