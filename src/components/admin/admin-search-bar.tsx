"use client";

import { Input } from "@/components/ui/input";
import { HiOutlineSearch, HiX } from "react-icons/hi";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder,
  onClear,
}: AdminSearchBarProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className="relative w-full">
      <HiOutlineSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border/50 w-full pl-9"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          aria-label="Clear search"
        >
          <HiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
