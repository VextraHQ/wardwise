import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get help and learn how to use WardWise. Documentation, FAQs, tutorials, and contact information.",
};

export default function HelpPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Help & Support
        </h1>
        <p className="text-muted-foreground text-sm">
          Get help and learn how to use WardWise
        </p>
      </div>

      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Help Center
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Help and support resources will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page will contain documentation, FAQs, tutorials, and contact
            information for support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
