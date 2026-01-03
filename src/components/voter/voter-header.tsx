import Link from "next/link";
import { HiMap, HiShieldCheck } from "react-icons/hi";

export function VoterHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-border bg-background/60 border-b backdrop-blur transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="WardWise home"
          >
            <div className="border-primary/20 bg-primary/5 text-primary flex h-10 w-10 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
              <HiMap className="h-6 w-6" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-foreground text-lg font-black tracking-tight sm:text-xl">
                WardWise
              </span>
              <span className="text-muted-foreground truncate text-[10px] font-medium sm:text-[10.5px]">
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
