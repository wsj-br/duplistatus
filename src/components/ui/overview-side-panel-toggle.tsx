"use client";

import { SquareMenu, ChartLine } from "lucide-react";
import { useServerSelection } from "@/contexts/server-selection-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OverviewSidePanelToggleProps {
  className?: string;
}

export function OverviewSidePanelToggle({ className }: OverviewSidePanelToggleProps) {
  const { state, setOverviewSidePanel } = useServerSelection();
  const { overviewSidePanel } = state;

  const handleToggle = () => {
    const newPanel = overviewSidePanel === 'status' ? 'chart' : 'status';
    setOverviewSidePanel(newPanel);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "absolute -top-2 -end-2 z-50 p-1 h-6 w-6 bg-gray-900 border border-blue-600 hover:bg-muted/50 transition-colors",
        className
      )}
      aria-label={`Switch to ${overviewSidePanel === 'status' ? 'chart' : 'status'} view`}
    >
      {overviewSidePanel === 'status' ? (

        <SquareMenu className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      ) : (
        <ChartLine className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      )}
    </Button>
  );
}
