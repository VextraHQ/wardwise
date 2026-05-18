import { ReportSiteFrame } from "@/features/reporting/components/report-site-layout";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReportSiteFrame>{children}</ReportSiteFrame>;
}
