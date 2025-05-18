import type { BackupStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: BackupStatus | 'N/A';
}

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  text: string;
  animate?: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<BackupStatus | 'N/A', StatusConfig> = {
    Success: { icon: CheckCircle2, color: "bg-green-500 hover:bg-green-600", text: "text-green-50" },
    Failed: { icon: XCircle, color: "bg-red-500 hover:bg-red-600", text: "text-red-50" },
    Warning: { icon: AlertTriangle, color: "bg-yellow-500 hover:bg-yellow-600", text: "text-yellow-50" },
    InProgress: { icon: Loader2, color: "bg-blue-500 hover:bg-blue-600", text: "text-blue-50", animate: "animate-spin" },
    'N/A': { icon: HelpCircle, color: "bg-gray-400 hover:bg-gray-500", text: "text-gray-50" },
  };

  const config = statusConfig[status] || statusConfig['N/A'];
  const IconComponent = config.icon;

  return (
    <Badge variant="default" className={cn("flex items-center gap-1.5 whitespace-nowrap", config.color, config.text)}>
      <IconComponent className={cn("h-3.5 w-3.5", config.animate)} />
      <span>{status}</span>
    </Badge>
  );
}
