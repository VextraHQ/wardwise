"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          success: "toast-success",
          error: "toast-error",
          info: "toast-info",
          warning: "toast-warning",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success": "var(--primary)",
          "--success-bg":
            "color-mix(in oklab, var(--primary) 5%, var(--popover))",
          "--success-border": "var(--primary)",
          "--success-text": "var(--popover-foreground)",
          "--error": "var(--destructive)",
          "--error-bg":
            "color-mix(in oklab, var(--destructive) 5%, var(--popover))",
          "--error-border": "var(--destructive)",
          "--error-text": "var(--popover-foreground)",
          "--info": "#3b82f6",
          "--info-bg": "color-mix(in oklab, #3b82f6 5%, var(--popover))",
          "--info-border": "#3b82f6",
          "--info-text": "var(--popover-foreground)",
          "--warning": "#f59e0b",
          "--warning-bg": "color-mix(in oklab, #f59e0b 5%, var(--popover))",
          "--warning-border": "#f59e0b",
          "--warning-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
