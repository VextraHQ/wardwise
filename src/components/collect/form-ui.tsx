import { HiArrowRight, HiArrowLeft } from "react-icons/hi";
import { IconLoader } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SectionLabel({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
        {title}
      </h3>
      <p className="text-muted-foreground text-xs">{subtitle}</p>
    </div>
  );
}

export function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="text-foreground text-[10px] font-bold tracking-widest uppercase">
      {children}
      {optional && (
        <span className="text-muted-foreground ml-1 font-normal tracking-normal normal-case">
          (optional)
        </span>
      )}
    </label>
  );
}

export function InputIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
      {children}
    </div>
  );
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-destructive text-[11px] font-medium">{error}</p>;
}

export function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  isLoading = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isLoading}
        aria-label="Go back to previous step"
        className="hover:bg-muted/10 h-11 shrink-0 rounded-sm px-4 text-xs font-bold tracking-widest uppercase sm:px-8"
      >
        <HiArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || isLoading}
        aria-label={nextLabel}
        className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 min-w-0 flex-1 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all active:scale-95 sm:text-xs"
      >
        {isLoading ? (
          <>
            <IconLoader className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            {nextLabel}
            <HiArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

/** Inline submit-error alert — reused on any step that triggers form submission */
export function SubmitError({ error }: { error?: string }) {
  if (!error) return null;
  const isDuplicate = error.includes("already registered");
  return (
    <div
      className={cn(
        "rounded-sm border p-4 text-center",
        isDuplicate
          ? "border-orange-500/30 bg-orange-500/10"
          : "bg-destructive/10 border-destructive/30",
      )}
    >
      <p
        className={cn(
          "text-sm font-bold",
          isDuplicate
            ? "text-orange-600 dark:text-orange-400"
            : "text-destructive",
        )}
      >
        {isDuplicate ? "Duplicate Registration Detected" : "Submission Failed"}
      </p>
      <p
        className={cn(
          "mt-1 text-xs",
          isDuplicate
            ? "text-orange-600/80 dark:text-orange-400/80"
            : "text-destructive/80",
        )}
      >
        {isDuplicate
          ? "This phone number or Voter ID (VIN) has already been submitted for this campaign. Each supporter can only register once."
          : error}
      </p>
    </div>
  );
}

/** Architectural card wrapper used by all form steps */
export function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]">
      <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
      <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />
      <div className="p-7 sm:p-10">{children}</div>
    </div>
  );
}

/** Section header inside a StepCard */
export function CardSectionHeader({
  title,
  subtitle,
  statusLabel,
  icon,
}: {
  title: string;
  subtitle: string;
  statusLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border-border/50 mb-6 flex items-center justify-between border-b pb-6">
      <div className="space-y-1">
        <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <div className="bg-primary/60 size-1.5 rounded-[1px]" />
          <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
            {subtitle} <span className="text-primary/40 mx-1">|</span>{" "}
            <span className="text-foreground font-bold">{statusLabel}</span>
          </p>
        </div>
      </div>
      <div className="bg-primary/5 text-primary border-primary/20 flex size-9 items-center justify-center rounded-sm border">
        {icon}
      </div>
    </div>
  );
}
