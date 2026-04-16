import type { Metadata } from "next";
import { NotFoundStatusScreen } from "@/components/system/not-found-status-screen";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested page was not found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <NotFoundStatusScreen />;
}
