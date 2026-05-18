import { GeoManagement } from "@/features/geo/components/geo-management";
import { createAdminMetadata } from "@/lib/core/metadata";

export const metadata = createAdminMetadata({
  title: "Geo Data",
  description:
    "Manage geographic data — States, LGAs, Wards, and Polling Units.",
});

export default function AdminGeoPage() {
  return <GeoManagement />;
}
