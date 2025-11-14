"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TemplateCard } from "@/components/candidate-dashboard/survey-builder/template-card";
import { getTemplatesByPosition } from "@/lib/mock/data/survey-templates";
import type { StepBasicInfoProps } from "@/types/survey-builder";
import { useCandidateProfile } from "@/hooks/use-candidate-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Candidate } from "@/types/candidate";

export function StepBasicInfo({
  title,
  description,
  estimatedMinutes,
  selectedTemplateId,
  onUpdate,
  onTemplateSelect,
}: StepBasicInfoProps) {
  const { data: candidateProfile, isLoading } = useCandidateProfile();

  const candidatePosition = candidateProfile?.position;
  const templates = getTemplatesByPosition(
    candidatePosition as Candidate["position"],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Survey Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g., Community Development Priorities for [Constituency]"
            value={title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            maxLength={200}
          />
          <p className="text-muted-foreground text-xs">
            {title.length}/200 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Survey Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Explain what this survey is about and how responses will be used..."
            value={description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={4}
            className="resize-none"
          />
          <p className="text-muted-foreground text-xs">
            {description.length} characters (minimum 20)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedMinutes">
            Estimated Completion Time{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={estimatedMinutes.toString()}
            onValueChange={(value) =>
              onUpdate({ estimatedMinutes: parseInt(value, 10) })
            }
          >
            <SelectTrigger id="estimatedMinutes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30].map((mins) => (
                <SelectItem key={mins} value={mins.toString()}>
                  {mins} {mins === 1 ? "minute" : "minutes"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              Start from Template (Optional)
            </h3>
            <p className="text-muted-foreground text-sm">
              Choose a pre-built template to get started quickly. You can
              customize all questions later.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={onTemplateSelect}
                isSelected={selectedTemplateId === template.id}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Start from Scratch</CardTitle>
              <CardDescription>
                Create a custom survey without using a template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                You can add questions manually in the next step. Templates are
                optional and can help you get started faster.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
