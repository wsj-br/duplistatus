"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChartSpline, ChartColumn } from "lucide-react";
import { 
  getTimeRangeAbbreviation, 
  CHART_TIME_RANGES,
  type ChartTimeRangeValue 
} from "@/lib/chart-utils";
import type { ChartTimeRange, ChartStyle } from "@/contexts/config-context";

interface ChartTimeRangeSelectorProps {
  value: ChartTimeRange;
  onChange: (value: ChartTimeRange) => void;
  chartStyle?: ChartStyle;
  onChartStyleChange?: (style: ChartStyle) => void;
  size?: "default" | "compact";
  className?: string;
}

/**
 * Inline time range selector for chart panels.
 * Displays pill-style buttons like stock charts: 1W | 2W | 1M | 3M
 * Includes a chart style toggle (line/bar) before the time ranges.
 *
 * @param value - Current selected time range
 * @param onChange - Callback when user selects a different range
 * @param chartStyle - Current chart style (smooth-line or bar)
 * @param onChartStyleChange - Callback when user toggles chart style
 * @param size - "default" for wider layouts, "compact" for narrow side panels
 * @param className - Additional CSS classes
 */
export function ChartTimeRangeSelector({
  value,
  onChange,
  chartStyle,
  onChartStyleChange,
  size = "default",
  className,
}: ChartTimeRangeSelectorProps) {
  const { t } = useTranslation();

  const isCompact = size === "compact";

  const handleChartStyleToggle = () => {
    if (onChartStyleChange) {
      const newStyle: ChartStyle = chartStyle === "bar" ? "smooth-line" : "bar";
      onChartStyleChange(newStyle);
    }
  };

  const handleTimeRangeChange = (range: ChartTimeRange) => {
    onChange(range);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md bg-muted p-0.5",
        className
      )}
      role="group"
      aria-label={t("Chart time range")}
    >
      {/* Chart style toggle button (line/bar) */}
      {chartStyle && onChartStyleChange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleChartStyleToggle}
          className={cn(
            "h-6 px-2 text-xs font-medium transition-all duration-200",
            isCompact && "px-1.5",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          aria-label={chartStyle === "bar" ? t("Switch to line chart") : t("Switch to bar chart")}
          title={chartStyle === "bar" ? t("Line chart") : t("Bar chart")}
        >
          {chartStyle === "bar" ? (
            <ChartColumn className="h-3.5 w-3.5" />
          ) : (
            <ChartSpline className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
      {CHART_TIME_RANGES.map((range) => {
        const isSelected = value === range;
        const abbr = getTimeRangeAbbreviation(range);

        return (
          <Button
            key={range}
            variant={isSelected ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleTimeRangeChange(range as ChartTimeRange)}
            className={cn(
              "h-6 px-2 text-xs font-medium transition-all duration-200",
              isCompact && "px-1.5 text-[10px]",
              isSelected
                ? "bg-background text-foreground shadow-sm hover:bg-background/90"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            aria-pressed={isSelected}
            aria-label={t(getTimeRangeAbbreviation(range))}
          >
            {abbr}
          </Button>
        );
      })}
    </div>
  );
}
