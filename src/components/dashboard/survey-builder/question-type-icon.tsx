import {
  IconCircleDot,
  IconCheckbox,
  IconArrowsSort,
  IconChartBar,
  IconFileText,
} from "@tabler/icons-react";
import type { QuestionTypeIconProps } from "@/types/survey-builder";
import { cn } from "@/lib/utils";

const iconMap = {
  single: IconCircleDot,
  multiple: IconCheckbox,
  ranking: IconArrowsSort,
  scale: IconChartBar,
  text: IconFileText,
};

export function QuestionTypeIcon({ type, className }: QuestionTypeIconProps) {
  const Icon = iconMap[type];

  return (
    <Icon className={cn("text-muted-foreground size-4 shrink-0", className)} />
  );
}
