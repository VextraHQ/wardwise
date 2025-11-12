"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QuestionEditor,
  QuestionTypeIcon,
} from "@/components/dashboard/survey-builder";
import type { StepQuestionsProps } from "@/types/survey-builder";
import type { SurveyQuestion } from "@/types";
import { IconPlus, IconTrash, IconCopy } from "@tabler/icons-react";

export function StepQuestions({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  minQuestions,
  maxQuestions,
}: StepQuestionsProps) {
  const [editingQuestion, setEditingQuestion] = useState<
    SurveyQuestion | undefined
  >();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEdit = (question: SurveyQuestion) => {
    setEditingQuestion(question);
    setIsEditorOpen(true);
  };

  const handleSave = (question: SurveyQuestion) => {
    if (editingQuestion) {
      onUpdateQuestion(editingQuestion.id, question);
    } else {
      onAddQuestion(question);
    }
    setEditingQuestion(undefined);
    setIsEditorOpen(false);
  };

  const handleAddNew = () => {
    setEditingQuestion(undefined);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Survey Questions</h3>
          <p className="text-muted-foreground text-sm">
            Add and manage questions for your survey. Minimum {minQuestions},
            maximum {maxQuestions}.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          disabled={questions.length >= maxQuestions}
        >
          <IconPlus className="mr-2 size-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4 text-center text-sm">
              No questions yet. Add your first question to get started.
            </p>
            <Button onClick={handleAddNew}>
              <IconPlus className="mr-2 size-4" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted flex size-6 items-center justify-center rounded text-xs font-semibold">
                        {index + 1}
                      </div>
                      <QuestionTypeIcon type={question.type} />
                      <Badge variant="outline">{question.type}</Badge>
                    </div>
                    <CardTitle className="mt-2 text-base">
                      {question.question}
                    </CardTitle>
                    {question.description && (
                      <CardDescription className="mt-1">
                        {question.description}
                      </CardDescription>
                    )}
                    {question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.slice(0, 3).map((opt) => (
                          <div
                            key={opt.id}
                            className="text-muted-foreground text-xs"
                          >
                            • {opt.label}
                            {opt.allowOther && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Other
                              </Badge>
                            )}
                          </div>
                        ))}
                        {question.options.length > 3 && (
                          <div className="text-muted-foreground text-xs">
                            +{question.options.length - 3} more options
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicateQuestion(question.id)}
                    >
                      <IconCopy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteQuestion(question.id)}
                      disabled={questions.length <= minQuestions}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <QuestionEditor
        question={editingQuestion}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
