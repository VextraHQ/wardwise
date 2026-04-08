import { Badge } from "@/components/ui/badge";

/* ── Time formatting ── */

export function timeAgo(isoDate: string | null): string {
  if (!isoDate) return "No submissions yet";
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;

  return new Date(isoDate).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

/* ── Text formatting ── */

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatRole(role: string) {
  return capitalize(role);
}

/* ── Campaign status ── */

export const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

export const STATUS_COPY: Record<string, string> = {
  active: "Registrations are actively coming in and the form remains live.",
  paused:
    "New registrations are paused, while historical reporting stays available.",
  closed:
    "This campaign is closed to new registrations, with prior activity preserved.",
  draft: "This campaign has not started collecting live registrations yet.",
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
