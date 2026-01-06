"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiArrowRight, HiArrowLeft, HiInformationCircle } from "react-icons/hi";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "../registration-step-header";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegistrationStore } from "@/stores/registration-store";
import { Alert, AlertDescription } from "@/components/ui/alert";

const canvasserSchema = z.object({
  canvasserCode: z.string().optional(),
});

type CanvasserFormValues = z.infer<typeof canvasserSchema>;

export function CanvasserStep() {
  const router = useRouter();
  const { update, payload } = useRegistrationStore();

  const form = useForm<CanvasserFormValues>({
    resolver: zodResolver(canvasserSchema),
    defaultValues: {
      canvasserCode: payload.canvasser?.canvasserCode || "",
    },
  });

  const onSubmit = async (values: CanvasserFormValues) => {
    update({
      canvasser: values,
    });
    router.push("/register/confirm");
  };

  const handleSkip = () => {
    update({
      canvasser: { canvasserCode: undefined },
    });
    router.push("/register/confirm");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-8">
      <StepProgress
        currentStep={5}
        totalSteps={5}
        stepTitle="Canvasser Referral"
      />

      <RegistrationStepHeader
        icon={Users}
        badge="Campaign Referral"
        title="Canvasser Code"
        description="Were you referred by a campaign canvasser? (Optional)"
      />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <Alert>
            <HiInformationCircle className="h-4 w-4" />
            <AlertDescription>
              If a canvasser gave you a referral code, enter it below. This
              helps candidates track their ground campaign efforts. You can skip
              this step if you registered on your own.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="canvasserCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canvasser Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., FINT-A001"
                        {...field}
                        className="uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the code provided by your canvasser (usually 8-10
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/candidate")}
                  className="flex-1"
                >
                  <HiArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip This Step
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
