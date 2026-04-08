import { ReportSiteFrame } from "@/components/campaign-report/report-site-layout";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReportSiteFrame>{children}</ReportSiteFrame>;
}
