"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { SurveyQuestion, SurveyOption } from "@/types";
import type { QuestionEditorProps } from "@/types/survey-builder";
import { QuestionTypeIcon } from "@/components/candidate-dashboard/survey-builder";
import { IconPlus, IconTrash } from "@tabler/icons-react";

const QUESTION_TYPES: Array<{
  value: SurveyQuestion["type"];
  label: string;
}> = [
  { value: "single", label: "Single Choice" },
  { value: "multiple", label: "Multiple Choice" },
  { value: "scale", label: "Scale (1-5)" },
  { value: "text", label: "Text Response" },
  { value: "ranking", label: "Ranking" },
];

export function QuestionEditor({
  question,
  isOpen,
  onClose,
  onSave,
}: QuestionEditorProps) {
  // Initialize state from props, reset when dialog opens/closes
  const getInitialState = () => {
    if (question) {
      return {
        type: question.type,
        questionText: question.question,
        description: question.description || "",
        options: question.options || [{ id: "opt-1", label: "" }],
        minLabel: question.minLabel || "",
        maxLabel: question.maxLabel || "",
      };
    }
    return {
      type: "single" as SurveyQuestion["type"],
      questionText: "",
      description: "",
      options: [{ id: "opt-1", label: "" }],
      minLabel: "",
      maxLabel: "",
    };
  };

  const [type, setType] = useState<SurveyQuestion["type"]>(
    getInitialState().type,
  );
  const [questionText, setQuestionText] = useState(
    getInitialState().questionText,
  );
  const [description, setDescription] = useState(getInitialState().description);
  const [options, setOptions] = useState<SurveyOption[]>(
    getInitialState().options,
  );
  const [minLabel, setMinLabel] = useState(getInitialState().minLabel);
  const [maxLabel, setMaxLabel] = useState(getInitialState().maxLabel);

  // Reset form when dialog opens/closes or question changes
  useEffect(() => {
    if (isOpen) {
      const initialState = getInitialState();
      setType(initialState.type);
      setQuestionText(initialState.questionText);
      setDescription(initialState.description);
      setOptions(initialState.options);
      setMinLabel(initialState.minLabel);
      setMaxLabel(initialState.maxLabel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, question?.id]);

  const needsOptions = type === "single" || type === "multiple";
  const needsScale = type === "scale";

  const handleAddOption = () => {
    setOptions([...options, { id: `opt-${Date.now()}`, label: "" }]);
  };

  const handleUpdateOption = (
    index: number,
    updates: Partial<SurveyOption>,
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    setOptions(newOptions);
  };

  const handleDeleteOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (!questionText.trim()) {
      return;
    }

    if (needsOptions && options.some((opt) => !opt.label.trim())) {
      return;
    }

    if (needsOptions && options.length < 2) {
      return;
    }

    const newQuestion: SurveyQuestion = {
      id: question?.id || `q-${Date.now()}`,
      type,
      question: questionText.trim(),
      description: description.trim() || undefined,
      options: needsOptions
        ? options.filter((opt) => opt.label.trim())
        : undefined,
      minLabel: needsScale ? minLabel : undefined,
      maxLabel: needsScale ? maxLabel : undefined,
    };

    onSave(newQuestion);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? "Edit Question" : "Add Question"}
          </DialogTitle>
          <DialogDescription>
            {question
              ? "Update the question details below"
              : "Create a new question for your survey"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Question Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={(value) =>
                setType(value as SurveyQuestion["type"])
              }
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <QuestionTypeIcon type={type} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((qt) => (
                  <SelectItem key={qt.value} value={qt.value}>
                    <div className="flex items-center gap-2">
                      <QuestionTypeIcon type={qt.value} />
                      <span>{qt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Question Text <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter your question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Add additional context or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {needsOptions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Options <span className="text-destructive">*</span> (Minimum
                  2)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  <IconPlus className="mr-1 size-4" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.label}
                      onChange={(e) =>
                        handleUpdateOption(index, { label: e.target.value })
                      }
                    />
                    <Checkbox
                      checked={option.allowOther || false}
                      onCheckedChange={(checked) =>
                        handleUpdateOption(index, {
                          allowOther: checked as boolean,
                        })
                      }
                    />
                    <Label className="text-xs">Allow "Other"</Label>
                    {options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOption(index)}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {needsScale && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Label</Label>
                <Input
                  placeholder="e.g., Very Dissatisfied"
                  value={minLabel}
                  onChange={(e) => setMinLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Label</Label>
                <Input
                  placeholder="e.g., Very Satisfied"
                  value={maxLabel}
                  onChange={(e) => setMaxLabel(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {question ? "Update" : "Add"} Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
