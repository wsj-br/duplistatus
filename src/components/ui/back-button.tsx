"use client";
import { useTranslation } from "react-i18next";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function BackButton({ variant = "outline", size = "sm", className }: BackButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button variant={variant} size={size} onClick={handleBack} className={className}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {t("Back")}
    </Button>
  );
} 