import { cn } from "@/lib/utils";

type LandingSectionEyebrowProps = {
  label: string;
  hint: string;
  align?: "left" | "center";
  className?: string;
};

export function LandingSectionEyebrow({
  label,
  hint,
  align = "left",
  className,
}: LandingSectionEyebrowProps) {
  return (
    <div
      className={cn(
        "mb-6 flex",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      <div className="border-primary/30 flex items-center gap-2.5 border-l-2 pl-4">
        <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">
          {label}
        </span>
        <span
          className="text-muted-foreground/35 text-[10px] font-bold"
          aria-hidden
        >
          ·
        </span>
        <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
          {hint}
        </span>
      </div>
    </div>
  );
}
