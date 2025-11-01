import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Dashboard Section Cards
 *
 * NOTE: Currently uses hardcoded values for demo
 * TODO: Replace with calculated metrics from voter data when building candidate dashboards:
 * - Total Supporters: getSupportersCount(candidateId)
 * - Ward Coverage: getUniqueWardsWithSupporters(candidateId).length / totalWards
 * - Polling Units: getUniquePollingUnitsWithSupporters(candidateId).length
 * - Support Strength: calculate from survey responses or engagement metrics
 */

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Supporters</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8,743
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-destructive/30 text-destructive"
            >
              <IconTrendingDown />
              -3.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Recent supporter decline <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Registered voters in Song & Fufore
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ward Coverage</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            16/20
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <IconTrendingUp />
              80%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Expanding ward presence <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Wards with active supporters
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Polling Units</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            387
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-destructive/30 text-destructive"
            >
              <IconTrendingDown />
              -5.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Lost some unit coverage <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Units with voter data</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Support Strength</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            82%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <IconTrendingUp />
              +6.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Improving candidate preference <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Average support rating</div>
        </CardFooter>
      </Card>
    </div>
  );
}
