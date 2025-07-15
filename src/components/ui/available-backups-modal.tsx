"use client";

import React, { useState } from "react";
import { History } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export function useAvailableBackupsModal() {
  const [availableBackupsModalOpen, setAvailableBackupsModalOpen] = useState(false);
  const [selectedAvailableBackups, setSelectedAvailableBackups] = useState<string[]>([]);
  const [selectedBackupDate, setSelectedBackupDate] = useState<string>('');
  const [iconPosition, setIconPosition] = useState<{ x: number; y: number } | null>(null);

  const handleAvailableBackupsClick = (availableBackups: string[], backupDate: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    setSelectedAvailableBackups(availableBackups);
    setSelectedBackupDate(backupDate);
    setIconPosition({ x, y });
    setAvailableBackupsModalOpen(true);
  };

  const formatAvailableBackupDate = (isoTimestamp: string): string => {
    try {
      const date = new Date(isoTimestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return 'Invalid date';
    }
  };

  const AvailableBackupsModal = () => {
    const getAnimationStyles = (): React.CSSProperties => {
      if (!iconPosition) return {};
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      
      const deltaX = iconPosition.x - centerX;
      const deltaY = iconPosition.y - centerY;
      
      return {
        '--origin-x': `${deltaX}px`,
        '--origin-y': `${deltaY}px`,
        animationName: 'zoom-in-from-icon',
        animationDuration: '0.2s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
      } as React.CSSProperties;
    };

    return (
      <>
        <style>{`
          @keyframes zoom-in-from-icon {
            0% {
              opacity: 0;
              transform: translate(var(--origin-x), var(--origin-y)) scale(0.1);
            }
            100% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
          }
        `}</style>
        <Dialog open={availableBackupsModalOpen} onOpenChange={setAvailableBackupsModalOpen}>
          <DialogContent 
            className="max-w-2xl"
            style={getAnimationStyles()}
          >
            <DialogHeader className="pb-3">
              <DialogTitle>Available Backups <span className="font-normal text-gray-400"> @ </span><span className="text-blue-400 font-normal">{new Date(selectedBackupDate).toLocaleString()}</span></DialogTitle>
            </DialogHeader>
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableCell className="font-medium text-blue-400 font-bold w-16 py-2 px-3">#</TableCell>
                    <TableCell className="font-medium text-blue-400 font-bold py-2 px-3">Backup Date</TableCell>
                    <TableCell className="font-medium text-blue-400 font-bold py-2 px-3">When</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* First row: Selected backup date */}
                  <TableRow className="border-b">
                    <TableCell className="w-16 py-1.5 px-3">1</TableCell>
                    <TableCell className="py-1.5 px-3">{formatAvailableBackupDate(selectedBackupDate)}</TableCell>
                    <TableCell className="py-1.5 px-3">{formatTimeAgo(selectedBackupDate)}</TableCell>
                  </TableRow>
                  {/* Additional available backups starting from #2 */}
                  {selectedAvailableBackups.map((timestamp, index) => (
                    <TableRow key={index} className="border-b">
                      <TableCell className="w-16 py-1.5 px-3">{index + 2}</TableCell>
                      <TableCell className="py-1.5 px-3">{formatAvailableBackupDate(timestamp)}</TableCell>
                      <TableCell className="py-1.5 px-3">{formatTimeAgo(timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return {
    handleAvailableBackupsClick,
    AvailableBackupsModal,
  };
}

interface AvailableBackupsIconProps {
  availableBackups: string[] | null;
  currentBackupDate: string;
  onIconClick: (availableBackups: string[], backupDate: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  count: number | null;
}

export function AvailableBackupsIcon({ availableBackups, currentBackupDate, onIconClick, count }: AvailableBackupsIconProps) {
  const hasAvailableBackups = availableBackups && availableBackups.length > 0;
  
  return (
    <div className="flex items-center justify-center gap-2">
      <span>
        {count !== null ? count.toLocaleString() : 'N/A'}
      </span>
      {hasAvailableBackups && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onIconClick(availableBackups, currentBackupDate, event);
          }}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="View available backups"
        >
          <History className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 