import Link from "next/link";
import { HiMap, HiShieldCheck } from "react-icons/hi";

export function VoterHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-border bg-background/60 border-b backdrop-blur transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="WardWise home"
          >
            <span className="relative flex size-12 items-center justify-center">
              <span className="border-border bg-card absolute inset-0 rounded-full border" />
              <span className="from-primary relative flex size-9 items-center justify-center rounded-full bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white">
                <HiMap className="size-5" />
              </span>
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-foreground text-base font-semibold tracking-[0.18em] uppercase">
                WardWise
              </span>
              <span className="text-muted-foreground text-[11px] font-medium">
                Civic Intelligence Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="border-primary/20 bg-primary/10 text-accent flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
              <HiShieldCheck className="size-4" />
              <span className="sm:hidden">Voter</span>
              <span className="hidden sm:inline">Voter Registration</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
