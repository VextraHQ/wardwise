import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TemplateCardProps } from "@/types/survey-builder";
import { IconClipboardList, IconClock, IconCheck } from "@tabler/icons-react";

export function TemplateCard({
  template,
  onSelect,
  isSelected,
}: TemplateCardProps) {
  return (
    <Card
      className={cn(
        "hover:border-primary cursor-pointer transition-all",
        isSelected && "border-primary ring-primary/20 ring-2",
      )}
      onClick={() => onSelect(template)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="mt-1">
              {template.description}
            </CardDescription>
          </div>
          {isSelected && (
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full">
              <IconCheck className="size-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{template.position}</Badge>
            <Badge variant="outline">{template.focusArea}</Badge>
          </div>

          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <IconClipboardList className="size-4" />
              <span>{template.questionCount} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <IconClock className="size-4" />
              <span>{template.estimatedMinutes} min</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Preview:</p>
            <p className="text-muted-foreground text-xs italic">
              "{template.preview.title}"
            </p>
            <div className="space-y-1">
              {template.preview.sampleQuestions.slice(0, 2).map((q, idx) => (
                <div
                  key={idx}
                  className="text-muted-foreground flex items-center gap-2 text-xs"
                >
                  <span className="text-muted-foreground/50">•</span>
                  <span className="line-clamp-1">{q.question}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant={isSelected ? "default" : "outline"}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            {isSelected ? "Selected" : "Use Template"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
