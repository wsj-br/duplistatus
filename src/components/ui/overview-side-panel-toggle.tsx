"use client";

import { useIntlayer } from 'react-intlayer';
import { SquareMenu, ChartLine } from "lucide-react";
import { useServerSelection } from "@/contexts/server-selection-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OverviewSidePanelToggleProps {
  className?: string;
}

export function OverviewSidePanelToggle({ className }: OverviewSidePanelToggleProps) {
  const content = useIntlayer('overview-side-panel-toggle');
  const { state, setOverviewSidePanel } = useServerSelection();
  const { overviewSidePanel } = state;

  const handleToggle = () => {
    const newPanel = overviewSidePanel === 'status' ? 'chart' : 'status';
    setOverviewSidePanel(newPanel);
  };

  const titleText = overviewSidePanel === 'status' ? content.switchToChart.value : content.switchToStatus.value;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "absolute top-0 end-0 z-50 p-1 h-6 w-6 bg-black-100 backdrop-blur-sm border-white-500 text-blue-600 shadow-lg hover:bg-blue-900 hover:border-blue-600 transition-all duration-200",
        className
      )}
      title={titleText}
      aria-label={titleText}
    >
      {overviewSidePanel === 'status' ? (

        <SquareMenu className="h-3 w-3 hover:text-foreground" />
      ) : (
        <ChartLine className="h-3 w-3 hover:text-foreground" />
      )}
    </Button>
  );
}
