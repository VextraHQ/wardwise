"use client";

import Link from "next/link";
import { HiShieldExclamation } from "react-icons/hi2";
import { AuthCard } from "@/components/auth/auth-card";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import { IconShieldOff } from "@tabler/icons-react";
import { COMPANY_INFO } from "@/lib/data/legal-data";

export function ReportUnavailable() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center">
      <RegistrationStepHeader
        icon={HiShieldExclamation}
        badge="Access Interrupted"
        title="Report Unavailable"
        description="This private Campaign Insights link is no longer accessible from your current session."
      />

      <AuthCard
        title="Access Unavailable"
        subtitle="Campaign Insights"
        status="Revoked"
        icon={IconShieldOff}
      >
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <IconShieldOff className="text-muted-foreground h-6 w-6" />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This private report link is invalid, expired, or has been revoked.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Please contact your campaign admin for a new access link, or{" "}
            <Link
              href={`/contact?email=${encodeURIComponent(COMPANY_INFO.supportEmail)}`}
              className="text-primary decoration-primary/30 font-semibold underline underline-offset-4"
            >
              reach WardWise Support
            </Link>
            .
          </p>
        </div>
      </AuthCard>
    </div>
  );
}
