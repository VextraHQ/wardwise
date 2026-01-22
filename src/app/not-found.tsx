import type { Metadata } from "next";
import { NotFoundContent } from "@/components/ui/not-found-content";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested page was not found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <NotFoundContent />;
}
