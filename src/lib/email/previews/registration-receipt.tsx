import { RegistrationReceiptTemplate } from "@/lib/email/templates/registration-receipt";

export default function RegistrationReceiptPreview() {
  return (
    <RegistrationReceiptTemplate
      candidateName="Hon. Musa Aliyu"
      campaignTitle={null}
      refCode="WW-A1B2C3D4"
      submittedAt={new Date("2026-05-18T14:32:00+01:00")}
      lgaName="Yola North"
      wardName="Doubeli"
      pollingUnitName="Primary School Doubeli"
      role="member"
      supportGroupName="Youth Wing, APC Adamawa"
    />
  );
}
