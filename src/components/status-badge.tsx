import type { BackupStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: BackupStatus | 'N/A';
  onClick?: () => void;
}

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  text: string;
  animate?: string;
}


export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const statusConfig: Record<BackupStatus | 'N/A', StatusConfig> = {
    Success: { icon: CheckCircle2, color: "bg-emerald-500 hover:bg-emerald-600", text: "text-emerald-50" },
    Unknown: { icon: HelpCircle, color: "bg-gray-400 hover:bg-gray-500", text: "text-gray-50" },
    Warning: { icon: AlertTriangle, color: "bg-yellow-500 hover:bg-yellow-600", text: "text-yellow-50" },
    Error:   { icon: XCircle, color: "bg-red-500 hover:bg-red-600", text: "text-red-50" },
    Fatal:   { icon: AlertOctagon, color: "bg-red-500 hover:bg-red-600", text: "text-red-50" },
    'N/A':   { icon: HelpCircle, color: "bg-gray-600 hover:bg-gray-600", text: "text-gray-50" },
  };

  const config = statusConfig[status] || statusConfig['N/A'];
  const IconComponent = config.icon;

  return (
    <Badge 
      variant="default" 
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap", 
        config.color, 
        config.text,
        onClick ? "hover:opacity-90" : ""
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <IconComponent className={cn("h-3.5 w-3.5", config.animate)} />
      <span>{status}</span>
    </Badge>
  );
}
