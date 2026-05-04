import { AccountWelcomeTemplate } from "@/lib/email/templates/account-welcome";

/** Dev-only: `pnpm email:dev`. */
export default function AccountWelcomePreview() {
  return (
    <AccountWelcomeTemplate
      greetingName="Ada"
      loginUrl="https://wardwise.ng/login"
    />
  );
}
