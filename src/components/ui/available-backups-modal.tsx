"use client";

import React, { useState, useMemo, createContext, useContext, useCallback } from "react";
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

// Global context for modal state to persist across auto refresh
interface ModalState {
  isOpen: boolean;
  availableBackups: string[];
  backupDate: string;
  machineName: string;
  backupName: string;
  iconPosition: { x: number; y: number } | null;
}

interface ModalContextType {
  modalState: ModalState;
  openModal: (data: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Global modal component that will be rendered in the layout
const GlobalAvailableBackupsModal = React.memo(() => {
  const { modalState, closeModal } = useModalContext();

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

  const getAnimationStyles = useMemo((): React.CSSProperties => {
    if (!modalState.iconPosition) return {};
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    const deltaX = modalState.iconPosition.x - centerX;
    const deltaY = modalState.iconPosition.y - centerY;
    
    return {
      '--origin-x': `${deltaX}px`,
      '--origin-y': `${deltaY}px`,
      animationName: 'zoom-in-from-icon',
      animationDuration: '0.2s',
      animationTimingFunction: 'ease-out',
      animationFillMode: 'both',
    } as React.CSSProperties;
  }, [modalState.iconPosition]);

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
      <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
        <DialogContent 
          className="max-w-2xl"
          style={getAnimationStyles}
        >
          <DialogHeader className="pb-3 leading-8">
            <DialogTitle>
            Available Backup Versions    <br /> <br />

              <span className="font-medium text-muted-foreground">{modalState.machineName} : </span><span className="font-medium text-muted-foreground">{modalState.backupName}</span>
              <span className="font-normal text-muted-foreground"> @ </span>
              <span className="text-blue-400 font-normal">{new Date(modalState.backupDate).toLocaleString()}</span>
            </DialogTitle>
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
                  <TableCell className="py-1.5 px-3">{formatAvailableBackupDate(modalState.backupDate)}</TableCell>
                  <TableCell className="py-1.5 px-3">{formatTimeAgo(modalState.backupDate)}</TableCell>
                </TableRow>
                {/* Additional available versions starting from #2 */}
                {modalState.availableBackups.map((timestamp, index) => (
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
});

export const AvailableBackupsModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    availableBackups: [],
    backupDate: '',
    machineName: '',
    backupName: '',
    iconPosition: null,
  });

  const openModal = useCallback((data: Omit<ModalState, 'isOpen'>) => {
    setModalState({
      ...data,
      isOpen: true,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
      {children}
      <GlobalAvailableBackupsModal />
    </ModalContext.Provider>
  );
};

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within AvailableBackupsModalProvider');
  }
  return context;
};

export function useAvailableBackupsModal() {
  const { openModal } = useModalContext();

  const handleAvailableBackupsClick = useCallback((availableBackups: string[], backupDate: string, machineName: string, backupName: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    openModal({
      availableBackups,
      backupDate,
      machineName,
      backupName,
      iconPosition: { x, y },
    });
  }, [openModal]);

  return {
    handleAvailableBackupsClick,
  };
}

interface AvailableBackupsIconProps {
  availableBackups: string[] | null;
  currentBackupDate: string;
  machineName: string;
  backupName: string;
  onIconClick: (availableBackups: string[], backupDate: string, machineName: string, backupName: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  count: number | null;
}

export function AvailableBackupsIcon({ availableBackups, currentBackupDate, machineName, backupName, onIconClick, count }: AvailableBackupsIconProps) {
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
            onIconClick(availableBackups, currentBackupDate, machineName, backupName, event);
          }}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Click to view available versions"
        >
          <History className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 