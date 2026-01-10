"use client";

import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiHome,
  HiPencilAlt,
  HiClipboardList,
  HiBell,
  HiCog,
} from "react-icons/hi";
import { cn } from "@/lib/utils";

interface ProfileNavigationProps {
  children: ReactNode;
  defaultValue?: string;
  surveyBadge?: number;
  updatesBadge?: number;
  onTabChange?: (value: string) => void;
}

interface NavItem {
  value: string;
  label: string;
  icon: typeof HiHome;
}

const navItems: NavItem[] = [
  { value: "dashboard", label: "Home", icon: HiHome },
  { value: "edit", label: "Edit", icon: HiPencilAlt },
  { value: "surveys", label: "Surveys", icon: HiClipboardList },
  { value: "updates", label: "Updates", icon: HiBell },
  { value: "settings", label: "Settings", icon: HiCog },
];

export function ProfileNavigation({
  children,
  defaultValue = "dashboard",
  surveyBadge = 1,
  updatesBadge = 2,
  onTabChange,
}: ProfileNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  const getBadge = (value: string): number | undefined => {
    if (value === "surveys" && surveyBadge > 0) return surveyBadge;
    if (value === "updates" && updatesBadge > 0) return updatesBadge;
    return undefined;
  };

  // Find the active child content
  const childrenArray = Array.isArray(children) ? children : [children];
  const activeContent = childrenArray.find(
    (child: React.ReactElement<TabContentProps>) =>
      child?.props?.value === activeTab,
  );

  return (
    <div className="relative">
      {/* Desktop Navigation - Top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative hidden overflow-hidden border sm:block"
      >
        <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />
        <div className="border-primary/30 absolute top-0 right-0 size-3 border-t border-r" />

        <div className="flex items-center gap-1 p-1.5">
          {navItems.map((item) => {
            const badge = getBadge(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleTabChange(item.value)}
                className={cn(
                  "relative flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-[10px] font-bold tracking-widest uppercase transition-all",
                  activeTab === item.value
                    ? "bg-primary/10 text-primary border-primary/20 border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
                {badge !== undefined && (
                  <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[8px] font-bold">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="mt-0 pb-20 sm:mt-5 sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Navigation - Fixed Bottom */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="border-border bg-card/95 supports-backdrop-filter:bg-card/80 border-t backdrop-blur-lg">
          <div className="flex items-stretch justify-around">
            {navItems.map((item) => {
              const badge = getBadge(item.value);
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTabChange(item.value)}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="bg-primary absolute top-0 h-0.5 w-10 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  {/* Icon with badge */}
                  <div className="relative">
                    <item.icon className="size-5" />
                    {badge !== undefined && (
                      <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full text-[8px] font-bold">
                        {badge}
                      </span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={cn(
                      "text-[9px] font-bold tracking-wide",
                      isActive && "font-extrabold",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

// Tab content wrapper component
interface TabContentProps {
  value: string;
  children: ReactNode;
}

export function TabContent({ children }: TabContentProps) {
  return <>{children}</>;
}
