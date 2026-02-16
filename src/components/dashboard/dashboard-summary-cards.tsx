// src/components/dashboard/dashboard-summary-cards.tsx
"use client";

import type { OverallSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Archive, UploadCloud, Database, FileSearch, AlertTriangle, ChartLine, LayoutDashboard, Sheet, ThumbsUp } from "lucide-react";
import { ColoredIcon } from "@/components/ui/colored-icon";
import { formatInteger, formatBytes } from "@/lib/number-format";
import { useLocale } from "@/contexts/locale-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerSelection } from "@/contexts/server-selection-context";
import { useCurrentUser } from "@/hooks/use-current-user";
import { setUserLocalStorageItem } from "@/lib/user-local-storage";
import { useIntlayer } from 'react-intlayer';

interface DashboardSummaryCardsProps {
  summary: OverallSummary;
  onViewModeChange?: (viewMode: 'table' | 'overview') => void;
}

const availableViewModes = ['overview', 'table'];

export function DashboardSummaryCards({ 
  summary, 
  onViewModeChange
}: DashboardSummaryCardsProps) {
  const { state: serverSelectionState, setViewMode } = useServerSelection();
  const { viewMode } = serverSelectionState;
  const currentUser = useCurrentUser();
  const content = useIntlayer('dashboard-summary-cards');
  const common = useIntlayer('common');
  const locale = useLocale();
  
  const viewModeTooltipsTexts = {
    overview: content.overviewView,
    table: content.tableView,
  };

  // Handle view mode toggle - cycle through available view modes
  const handleViewModeToggle = () => {
    const currentIndex = availableViewModes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % availableViewModes.length;
    const newViewMode = availableViewModes[nextIndex] as 'table' | 'overview';
    
    setViewMode(newViewMode);
    // Note: setViewMode already saves to user-specific localStorage, but we keep this for compatibility
    if (currentUser) {
      setUserLocalStorageItem('dashboard-view-mode', currentUser.id, newViewMode);
    }
    onViewModeChange?.(newViewMode);
  };

  const summaryItems = [
    {
      id: 'totalServers',
      title: content.totalServers,
      value: formatInteger(summary.totalServers, locale),
      icon: <ColoredIcon icon={HardDrive} color="blue" size="lg" />,
      "data-ai-hint": "server computer",
    },
    {
      id: 'totalBackupJobs',
      title: content.totalBackupJobs,
      value: formatInteger(summary.totalBackups, locale),
      icon: <ColoredIcon icon={Archive} color="green" size="lg" />,
      "data-ai-hint": "archive box",
    },
    {
      id: 'totalBackupRuns',
      title: content.totalBackupRuns,
      value: formatInteger(summary.totalBackupsRuns, locale),
      icon: <ColoredIcon icon={Archive} color="purple" size="lg" />,
      "data-ai-hint": "archive box",
    },
    {
      id: 'totalBackupSize',
      title: content.totalBackupSize,
      value: formatBytes(summary.totalBackupSize, locale),
      icon: <ColoredIcon icon={FileSearch} color="yellow" size="lg" />,
      "data-ai-hint": "file search",
    },
    {
      id: 'totalStorageUsed',
      title: content.totalStorageUsed,
      value: formatBytes(summary.totalStorageUsed, locale),
      icon: <ColoredIcon icon={Database} color="blue" size="lg" />,
      "data-ai-hint": "database storage",
    },
    {
      id: 'totalUploadedSize',
      title: content.totalUploadedSize,
      value: formatBytes(summary.totalUploadedSize, locale),
      icon: <ColoredIcon icon={UploadCloud} color="blue" size="lg" />,
      "data-ai-hint": "cloud upload",
    },
    // Only show Overdue Backups card when not in overview mode
    ...(viewMode !== 'overview' ? [{
      id: 'overdueBackups',
      title: content.overdueBackups,
      value: formatInteger(summary.overdueBackupsCount, locale),
      icon: summary.overdueBackupsCount > 0 ? (
        <ColoredIcon icon={AlertTriangle} color="red" size="lg" />
      ) : (
        <ColoredIcon icon={ThumbsUp} color="green" size="lg" />
      ),
      "data-ai-hint": "alert triangle",
    }] : []),
  ];

  return (
    <div className="flex gap-3" data-screenshot-target="dashboard-summary">
      <div className={`grid gap-3 md:grid-cols-2 ${viewMode === 'overview' ? 'lg:grid-cols-6' : 'lg:grid-cols-7'} flex-1`}>
        {summaryItems.map((item) => (
          <Card key={item.id} variant="modern" hover={true} data-ai-hint={item['data-ai-hint']}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className={`text-2xl font-bold ${item.id === 'overdueBackups' ? (summary.overdueBackupsCount > 0 ? 'text-red-600' : 'text-gray-500') : ''}`}>
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Toggle View Mode Card */}
      <Card variant="modern" hover={true} className="w-fit flex-shrink-0 flex items-center justify-center">
        <div className="p-3 text-center">
          <TooltipProvider>
            <Tooltip delayDuration={1000}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  // className="h-8 w-8 p-0 hover:bg-transparent "
                  className="h-8 w-8 p-6  [&_svg]:!h-8 [&_svg]:!w-8 text-blue-600 hover:text-foreground bg-black-100 backdrop-blur-sm border-white-500 text-blue-600 shadow-lg hover:bg-blue-900 hover:border-blue-600 transition-all duration-200"
                  onClick={handleViewModeToggle}
                  data-screenshot-target="dashboard-view-mode-toggle"
                >
                  {viewMode === 'table' ? (
                    <Sheet className="h-8 w-8" />
                  ) : (
                    <LayoutDashboard className="h-6 w-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{common.ui.show} {(() => {
                  const currentIndex = availableViewModes.indexOf(viewMode);
                  const nextIndex = (currentIndex + 1) % availableViewModes.length;
                  const nextViewMode = availableViewModes[nextIndex];
                  return viewModeTooltipsTexts[nextViewMode as keyof typeof viewModeTooltipsTexts];
                })()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* <div className="text-xs text-muted-foreground mt-2">
            {viewMode === 'analytics' ? 'Switch to Table' : 'Switch to Analytics'}
          </div> */}
        </div>
      </Card>
    </div>
  );
}
