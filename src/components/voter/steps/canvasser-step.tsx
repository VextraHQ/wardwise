"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiArrowRight, HiArrowLeft, HiInformationCircle } from "react-icons/hi";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
import { motion } from "motion/react";
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
    <div className="mx-auto w-full max-w-2xl space-y-10 py-8">
      <StepProgress
        currentStep={5}
        totalSteps={6}
        stepTitle="Canvasser Referral"
      />

      <RegistrationStepHeader
        icon={Users}
        badge="Campaign Referral"
        title="Canvasser Code"
        description="Were you referred by a campaign canvasser? (Optional)"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="p-7 sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                Referral Information
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  Referral Validation{" "}
                  <span className="text-primary/40 mx-1">|</span>{" "}
                  <span className="text-foreground font-bold">Optional</span>
                </p>
              </div>
            </div>
          </div>

          <Alert className="bg-muted/30 border-primary/20 mb-8">
            <HiInformationCircle className="text-primary h-4 w-4" />
            <AlertDescription className="text-muted-foreground/80 text-xs">
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
                    <FormLabel className="text-xs font-bold tracking-widest uppercase">
                      Canvasser Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., FINT-A001"
                        {...field}
                        className="border-border/60 focus:border-primary/50 h-11 font-mono tracking-wider uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] tracking-wide uppercase">
                      Enter the code provided by your canvasser (usually 8-10
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/candidate")}
                  className="hover:bg-muted/10 h-11 flex-1 rounded-xl text-xs font-bold tracking-widest uppercase"
                >
                  <HiArrowLeft className="mr-2 h-3 w-3" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="hover:bg-muted/10 h-11 flex-1 rounded-xl text-xs font-bold tracking-widest uppercase"
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 flex-1 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
                >
                  Continue
                  <HiArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
