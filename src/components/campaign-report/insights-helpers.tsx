import { Badge } from "@/components/ui/badge";

/* ── Campaign status ── */

export const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

/* ── Submission status badge ── */

export function SubmissionStatusBadge({
  isVerified,
  isFlagged,
}: {
  isVerified: boolean;
  isFlagged: boolean;
}) {
  if (isFlagged) {
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
      >
        Flagged
      </Badge>
    );
  }

  if (isVerified) {
    return (
      <Badge
        variant="outline"
        className="bg-primary/10 text-primary border-primary/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
      >
        Verified
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="rounded-sm border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase"
    >
      Pending
    </Badge>
  );
}
