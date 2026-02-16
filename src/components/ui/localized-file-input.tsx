"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface LocalizedFileInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  chooseFileText: string;
  noFileChosenText: string;
  className?: string;
}

const LocalizedFileInput = React.forwardRef<HTMLInputElement, LocalizedFileInputProps>(
  ({ chooseFileText, noFileChosenText, className, accept, disabled, onChange, id, ...props }, ref) => {
    const [fileName, setFileName] = React.useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement);

    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setFileName(file?.name || "");
      onChange?.(e);
    };

    return (
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
          id={id}
          {...props}
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={cn(
            "rounded-md border-0 bg-white px-4 py-2 text-sm font-semibold text-[#222222]",
            "hover:bg-gray-100 transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          {chooseFileText}
        </button>
        <span className={cn(
          "text-sm",
          fileName ? "font-bold text-white" : "text-muted-foreground"
        )}>
          {fileName || noFileChosenText}
        </span>
      </div>
    );
  }
);

LocalizedFileInput.displayName = "LocalizedFileInput";

export { LocalizedFileInput };
