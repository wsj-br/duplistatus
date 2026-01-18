'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useIntlayer } from 'react-intlayer';
import { useLocale } from '@/contexts/locale-context';
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
import { Download, ChevronLeft, ChevronRight, Eye, Calendar as CalendarIcon, Loader2, RefreshCcw } from 'lucide-react';
import { formatRelativeTime, formatSQLiteTimestamp } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';

// Configuration constants
const INITIAL_ROW_COUNT = 20; // Initial number of rows to load
const LOAD_BATCH_SIZE = 40;   // Batch size to load more logs

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
  const content = useIntlayer('audit-log-viewer');
  const common = useIntlayer('common');
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const loadedCountRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate sizes
  const initialLoadSize = INITIAL_ROW_COUNT;
  const batchSize = LOAD_BATCH_SIZE;
  const hasMore = logs.length < total;

  // Sync ref with state - use logs.length for accurate tracking
  useEffect(() => {
    loadedCountRef.current = logs.length;
  }, [logs.length]);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [username, setUsername] = useState('');
  const [action, setAction] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  // Filter values from database
  const [filterValues, setFilterValues] = useState<{
    actions: string[];
    categories: string[];
    statuses: string[];
  }>({
    actions: [],
    categories: [],
    statuses: [],
  });
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Load audit logs
  const loadLogs = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setLoadedCount(0);
        setLogs([]);
      } else {
        setIsLoadingMore(true);
      }

      // Get current offset - use 0 for initial, or current loadedCount for more
      const currentOffset = isInitial ? 0 : loadedCount;
      const limit = isInitial ? initialLoadSize : batchSize;

      const params = new URLSearchParams({
        offset: currentOffset.toString(),
        limit: limit.toString(),
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
      const newLogs = data.logs || [];

      if (isInitial) {
        setLogs(newLogs);
        setLoadedCount(newLogs.length);
      } else {
        // Deduplicate logs by ID to prevent duplicate keys
        setLogs(prev => {
          const existingIds = new Set(prev.map((log: AuditLog) => log.id));
          const uniqueNewLogs = newLogs.filter((log: AuditLog) => !existingIds.has(log.id));
          // Update loadedCount based on the unique logs we're actually adding
          setLoadedCount(currentCount => currentCount + uniqueNewLogs.length);
          return [...prev, ...uniqueNewLogs];
        });
      }

      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: common.status.error,
        description: content.failedToLoadAuditLogs,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [startDate, endDate, username, action, category, status, loadedCount, initialLoadSize, batchSize, toast, common.status.error, content.failedToLoadAuditLogs]);

  // Load more logs when scrolling
  const loadMoreLogs = useCallback(async () => {
    if (logs.length >= total || isLoadingMore || loading) return;

    try {
      setIsLoadingMore(true);
      const limit = batchSize;
      const offset = loadedCount; // Use loadedCount state for consistent offset tracking

      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
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
      const newLogs = data.logs || [];
      const apiTotal = data.pagination?.total || 0;

      // If API returned 0 logs, we've reached the end
      if (newLogs.length === 0) {
        setLogs(prev => {
          setTotal(prev.length);
          return prev;
        });
        return;
      }

      // Deduplicate logs by ID to prevent duplicate keys
      setLogs(prev => {
        const existingIds = new Set(prev.map((log: AuditLog) => log.id));
        const uniqueNewLogs = newLogs.filter((log: AuditLog) => !existingIds.has(log.id));

        // If we got 0 new unique logs but API returned logs, we've reached the end
        // This happens when all returned logs are duplicates (we've already loaded everything)
        if (uniqueNewLogs.length === 0) {
          // Update total to current length to stop infinite loading
          setTotal(prev.length);
          return prev;
        }

        const updatedLogs = [...prev, ...uniqueNewLogs];

        // If we received fewer logs than requested, we've reached the end
        // Update total to reflect the actual number of logs we have
        if (newLogs.length < limit) {
          setTotal(updatedLogs.length);
        } else {
          setTotal(apiTotal);
        }

        // Update loadedCount based on the unique logs we're actually adding
        setLoadedCount(currentCount => currentCount + uniqueNewLogs.length);
        return updatedLogs;
      });
    } catch (error) {
      console.error('Error loading more audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more audit logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [logs.length, total, isLoadingMore, loading, loadedCount, batchSize, startDate, endDate, username, action, category, status, toast]);

  // Initial load and filter changes
  useEffect(() => {
    loadLogs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, username, action, category, status]);

  // IntersectionObserver for scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && logs.length < total && !isLoadingMore && !loading) {
          loadMoreLogs();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.disconnect();
      }
    };
  }, [logs.length, total, isLoadingMore, loading, loadMoreLogs]);

  // Load filter values from database on mount
  useEffect(() => {
    const loadFilterValues = async () => {
      try {
        setLoadingFilters(true);
        const response = await authenticatedRequestWithRecovery('/api/audit-log/filters');
        if (!response.ok) throw new Error('Failed to load filter values');
        const data = await response.json();
        setFilterValues({
          actions: data.actions || [],
          categories: data.categories || [],
          statuses: data.statuses || [],
        });
      } catch (error) {
        console.error('Error loading filter values:', error);
        toast({
          title: common.status.warning,
          description: content.failedToLoadFilterValues,
          variant: 'destructive',
        });
      } finally {
        setLoadingFilters(false);
      }
    };
    loadFilterValues();
  }, [toast, common.status.warning, content.failedToLoadFilterValues]);

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
        title: common.status.success,
        description: content.auditLogDownloadedAs.value.replace('{format}', format.toUpperCase()),
      });
    } catch (error) {
      console.error('Error downloading audit logs:', error);
      toast({
        title: common.status.error,
        description: content.failedToDownloadAuditLogs || 'Failed to download audit logs',
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
  };

  // Get status badge color
  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">{content.success}</Badge>;
      case 'failure':
        return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">{content.failure}</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">{content.error}</Badge>;
      default:
        return <Badge>{statusValue}</Badge>;
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
    <div className="space-y-4" data-screenshot-target="settings-content-card">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{content.auditLogViewer}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => loadLogs(true)}
          disabled={loading}
          title={content.refreshAuditLogs}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {content.refresh}
        </Button>
      </div>

      {/* Filters */}
      <div className="border rounded-md p-4 space-y-4 bg-muted/30 relative z-30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {content.auditLogViewerFilters}
          </h3>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {content.reset}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('csv')}>
              <Download className="h-4 w-4 mr-2" />
              {content.csv}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('json')}>
              <Download className="h-4 w-4 mr-2" />
              {content.json}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">{content.startDate}</Label>
            <DatePicker
              id="start-date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">{content.endDate}</Label>
            <DatePicker
              id="end-date"
              value={endDate}
              onChange={(value) => {
                setEndDate(value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">{content.username}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder={content.filterByUsername.value}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="action">{content.action}</Label>
            <Select value={action} onValueChange={(value) => {
              setAction(value);
            }}>
              <SelectTrigger id="action">
                <SelectValue placeholder={content.allActions.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{content.allActions}</SelectItem>
                {filterValues.actions.map(act => (
                  <SelectItem key={act} value={act}>{act}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{content.category}</Label>
            <Select value={category} onValueChange={(value) => {
              setCategory(value);
            }}>
              <SelectTrigger id="category">
                <SelectValue placeholder={content.allCategories.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{content.allCategories}</SelectItem>
                {filterValues.categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{content.status}</Label>
            <Select value={status} onValueChange={(value) => {
              setStatus(value);
            }}>
              <SelectTrigger id="status">
                <SelectValue placeholder={content.allStatuses.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{content.allStatuses}</SelectItem>
                {filterValues.statuses.map(st => (
                  <SelectItem key={st} value={st}>{st}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">{content.loadingAuditLogs}</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{content.noAuditLogsFound}</div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-md">
            <div
              ref={scrollContainerRef}
              className="max-h-[calc(100vh-417px)] overflow-y-auto custom-scrollbar pb-4"
            >
              <div className="[&>div]:overflow-visible">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-muted border-b-2 border-border shadow-sm">
                    <TableRow className="bg-muted">
                      <TableHead className="bg-muted w-12 text-center">{content.tableNumber}</TableHead>
                      <TableHead className="bg-muted">{content.timestamp}</TableHead>
                      <TableHead className="bg-muted">{content.user}</TableHead>
                      <TableHead className="bg-muted">{content.actionHeader}</TableHead>
                      <TableHead className="bg-muted">{content.categoryHeader}</TableHead>
                      <TableHead className="bg-muted">{content.statusHeader}</TableHead>
                      <TableHead className="bg-muted">{content.target}</TableHead>
                      <TableHead className="text-right bg-muted">{content.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, index) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-center text-muted-foreground w-12">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>{formatSQLiteTimestamp(log.timestamp)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeTime(log.timestamp, undefined, locale)}
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
                            title={content.viewDetails.value}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Loading sentinel for IntersectionObserver */}
                    {logs.length < total && (
                      <TableRow ref={sentinelRef}>
                        <TableCell colSpan={8} className="text-center py-4">
                          {isLoadingMore && (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">{content.loadingMore}</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* End of data indicator */}
                    {logs.length >= total && logs.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-sm text-muted-foreground">
                          {content.noMoreLogsToLoad}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination - Alternative navigation */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {total > 0 ? (
                  <>Loaded {Math.min(logs.length, total)} of {total} total ({Math.min(100, Math.round((Math.min(logs.length, total) / total) * 100))}% loaded)</>
                ) : (
                  <>No logs available</>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Scroll to top only - don't reload data
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={loading || logs.length === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Reset to Top
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>{content.auditLogDetails}</DialogTitle>
            <DialogDescription>
              {content.completeInformationForAuditLogEntry.value.replace('{id}', selectedLog?.id?.toString() || '')}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 px-6 pb-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">{content.timestampLabel}</Label>
                  <div className="text-sm">{formatSQLiteTimestamp(selectedLog.timestamp)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{content.statusLabel}</Label>
                  <div>{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{content.userLabel}</Label>
                  <div className="text-sm">{selectedLog.username || content.system}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{content.categoryLabel}</Label>
                  <div>{getCategoryBadge(selectedLog.category)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{content.actionLabel}</Label>
                  <div className="text-sm font-mono">{selectedLog.action}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{content.ipAddress}</Label>
                  <div className="text-sm">{selectedLog.ipAddress || '—'}</div>
                </div>
                {selectedLog.targetType && (
                  <div>
                    <Label className="text-xs text-muted-foreground">{content.targetType}</Label>
                    <div className="text-sm">{selectedLog.targetType}</div>
                  </div>
                )}
                {selectedLog.targetId && (
                  <div>
                    <Label className="text-xs text-muted-foreground">{content.targetId}</Label>
                    <div className="text-sm font-mono">{selectedLog.targetId}</div>
                  </div>
                )}
              </div>
              {selectedLog.userAgent && (
                <div>
                  <Label className="text-xs text-muted-foreground">{content.userAgent}</Label>
                  <div className="text-sm break-all">{selectedLog.userAgent}</div>
                </div>
              )}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">{content.details}</Label>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.errorMessage && (
                <div>
                  <Label className="text-xs text-muted-foreground">{content.errorMessage}</Label>
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

