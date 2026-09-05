"use client";

import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import type { DuplicatiChannel, DuplicatiVersionStatus } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DuplicatiVersionBadgeProps {
  version: DuplicatiVersionStatus | undefined;
  size?: 'sm' | 'md';
}

function getChannelLabel(
  channel: DuplicatiChannel | null,
  t: (key: string) => string
): string {
  switch (channel) {
    case 'stable':
      return t("Stable");
    case 'beta':
      return t("Beta");
    case 'experimental':
      return t("Experimental");
    case 'canary':
      return t("Canary");
    case null:
      return t("Unknown");
    default: {
      const exhaustive: never = channel;
      return exhaustive;
    }
  }
}

export function DuplicatiVersionBadge({ version, size = 'md' }: DuplicatiVersionBadgeProps) {
  const { t } = useTranslation();
  const displayVersion = version?.versionNumber ?? '—';
  const isOutdated = version?.comparison === 'outdated';

  const handleInteraction = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "font-medium cursor-help bg-transparent border-0 p-0 leading-none",
            size === 'sm' ? 'text-xs' : 'text-sm',
            isOutdated ? 'text-yellow-500' : 'text-muted-foreground'
          )}
          onClick={handleInteraction}
          onPointerDown={handleInteraction}
        >
          {displayVersion}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        className="space-y-1"
        onClick={handleInteraction}
        onPointerDown={handleInteraction}
      >
        <div>
          {t("Channel:")} {getChannelLabel(version?.channel ?? null, t)}
        </div>
        <div>
          {t("Server version:")} {version?.versionNumber ?? t("Unknown")}
        </div>
        {version?.comparison === 'unavailable' || !version?.latestVersionNumber ? (
          <div>{t("Version comparison is unavailable.")}</div>
        ) : (
          <div>
            {t("Latest {{channel}} version:", { channel: getChannelLabel(version.channel, t) })} {version.latestVersionNumber}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
