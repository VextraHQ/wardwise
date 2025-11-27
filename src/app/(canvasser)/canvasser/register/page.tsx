import { Metadata } from "next";
import { CanvasserRegisterForm } from "@/components/canvasser/canvasser-register-form";

export const metadata: Metadata = {
  title: "Register Voter | WardWise Canvasser",
  description: "Register a new voter on behalf of a constituent.",
};

export default function CanvasserRegisterPage() {
  return <CanvasserRegisterForm />;
}
