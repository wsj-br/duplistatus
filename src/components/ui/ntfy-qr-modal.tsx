"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';

interface NtfyQrModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeDataUrl: string;
  topicUrl: string;
}

export function NtfyQrModal({ isOpen, onOpenChange, qrCodeDataUrl, topicUrl }: NtfyQrModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md data-[state=open]:modal-zoom-center data-[state=closed]:modal-zoom-center-out" data-screenshot-target="ntfy-configure-device-popup">
        <DialogHeader>
          <DialogTitle>Configure your device</DialogTitle>
          <DialogDescription>
            Scan this QR code with your device to receive NTFY notifications for this topic.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {qrCodeDataUrl && (
            <>
              <p className="text-xs text-muted-foreground break-all">{topicUrl}</p>
              <div className="p-4 bg-white rounded-lg">
              <Image 
                  src={qrCodeDataUrl} 
                  alt="NTFY Configuration QR Code" 
                  width={256}
                  height={256}
                  className="w-full h-auto"
              />
              </div>
            </>
          )}
          <p className="text-sm text-foreground text-center">
            Open your device camera or a QR code scanner app to scan this code.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            <a href="https://ntfy.sh/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">Before scanning install the NTFY app from the Play Store, App Store or F-Droid</a>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
