import { createCanvasserMetadata } from "@/lib/metadata";
import { CanvasserRegisterForm } from "@/components/canvasser/canvasser-register-form";

export const metadata = createCanvasserMetadata({
  title: "Register Voter",
  description: "Register a new voter on behalf of a constituent.",
});

export default function CanvasserRegisterPage() {
  return <CanvasserRegisterForm />;
}
