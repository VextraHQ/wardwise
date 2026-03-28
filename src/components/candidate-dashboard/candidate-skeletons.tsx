export function CandidateDashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Mimic the candidate dashboard stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 bg-card animate-pulse rounded-sm border border-dashed p-4"
          >
            <div className="flex items-center justify-between">
              <div className="bg-muted/40 h-3 w-20 rounded" />
              <div className="bg-primary/10 h-8 w-8 rounded-sm" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="bg-muted/30 h-7 w-14 rounded" />
              <div className="bg-muted/20 h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Mimic main content area */}
      <div className="border-border/60 bg-card animate-pulse rounded-sm border border-dashed p-6">
        <div className="space-y-2">
          <div className="bg-muted/40 h-4 w-44 rounded" />
          <div className="bg-muted/20 h-3 w-80 rounded" />
        </div>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-border/30 rounded-sm border border-dashed p-4">
              <div className="flex items-center justify-between">
                <div className="bg-muted/30 h-4 w-36 rounded" />
                <div className="bg-muted/20 h-5 w-16 rounded" />
              </div>
              <div className="bg-muted/10 mt-3 h-2 w-full rounded-full">
                <div
                  className="bg-muted/30 h-2 rounded-full"
                  style={{ width: `${60 - i * 12}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
