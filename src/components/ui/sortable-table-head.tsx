import React from "react";
import { TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortConfig } from "@/lib/sort-utils";

interface SortableTableHeadProps {
  children: React.ReactNode;
  column: string;
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function SortableTableHead({
  children,
  column,
  sortConfig,
  onSort,
  className,
  align = 'left'
}: SortableTableHeadProps) {
  const isActive = sortConfig.column === column;
  const isAsc = isActive && sortConfig.direction === 'asc';
  const isDesc = isActive && sortConfig.direction === 'desc';

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const getSortIcon = () => {
    if (isAsc) {
      return <ChevronUp className="h-4 w-4" />;
    }
    if (isDesc) {
      return <ChevronDown className="h-4 w-4" />;
    }
    return;  //<ChevronsUpDown className="h-4 w-4 opacity-50" />;
  };

  return (
    <TableHead 
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        alignClass,
        className
      )}
      onClick={() => onSort(column)}
    >
      <div className={cn(
        "flex items-center gap-1",
        align === 'center' && "justify-center",
        align === 'right' && "justify-end"
      )}>
        {children}
        {getSortIcon()}
      </div>
    </TableHead>
  );
} 