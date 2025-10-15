"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Users,
  ClipboardList,
  Edit,
  LogOut,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";

export function VoterProfile() {
  const { payload, reset } = useRegistration();
  const [canEdit, setCanEdit] = useState(true); // In production, check if within 7 days

  const fullName =
    `${payload.basic?.firstName || ""} ${payload.basic?.lastName || ""}`.trim();
  const registrationDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              My Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              View and manage your voter registration
            </p>
          </div>
          <Button variant="outline" onClick={reset} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Status Banner */}
        <Card className="border-primary/30 bg-primary/10">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="text-primary h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-foreground font-semibold">
                Registration Active
              </p>
              <p className="text-muted-foreground text-sm">
                Registered on {registrationDate}
              </p>
            </div>
            {canEdit && (
              <Badge variant="secondary" className="gap-1">
                <Edit className="h-3 w-3" />
                Editable
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Full Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Info Card */}
            <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="border-border/60 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="text-primary h-5 w-5" />
                    <h3 className="text-foreground font-semibold">
                      Personal Information
                    </h3>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-muted-foreground text-xs">Full Name</p>
                  <p className="text-foreground font-medium">
                    {fullName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Age</p>
                  <p className="text-foreground font-medium">
                    {payload.basic?.age || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Gender</p>
                  <p className="text-foreground font-medium capitalize">
                    {payload.basic?.gender || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="text-foreground font-medium">
                    {payload.phone || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="border-border/60 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary h-5 w-5" />
                    <h3 className="text-foreground font-semibold">
                      Voting Location
                    </h3>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-muted-foreground text-xs">State</p>
                  <p className="text-foreground font-medium">
                    {payload.location?.state || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">LGA</p>
                  <p className="text-foreground font-medium">
                    {payload.location?.lga || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ward</p>
                  <p className="text-foreground font-medium">
                    {payload.location?.ward || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Polling Unit</p>
                  <p className="text-foreground font-medium">
                    {payload.location?.pollingUnit || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Survey Status Card */}
            <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="border-border/60 border-b pb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="text-primary h-5 w-5" />
                  <h3 className="text-foreground font-semibold">
                    Survey Status
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Survey Completed
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Questions Answered
                  </span>
                  <span className="text-foreground font-semibold">8 of 8</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Survey Responses
                </Button>
              </CardContent>
            </Card>

            {/* Candidate Card */}
            <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="border-border/60 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary h-5 w-5" />
                    <h3 className="text-foreground font-semibold">
                      Candidate Support
                    </h3>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Change
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <p className="text-muted-foreground text-xs">
                    Currently Supporting
                  </p>
                  <p className="text-foreground font-semibold">
                    Hon. Ahmed Suleiman (APC)
                  </p>
                </div>
                <div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
                  <span className="text-muted-foreground text-sm">
                    Total Supporters
                  </span>
                  <span className="text-foreground font-semibold">2,847</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Candidate Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Important Notice */}
          <Card className="border-primary/30 bg-primary/10">
            <CardContent className="flex items-start gap-3 py-4">
              <Shield className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-foreground font-semibold">
                  Data Protection Notice
                </p>
                <p className="text-muted-foreground text-sm">
                  Your information is encrypted and secure. You can update your
                  details once within 7 days of registration. After that, your
                  data is locked to maintain election integrity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-border/60 border-b">
              <h3 className="text-foreground text-lg font-semibold">
                Complete Registration Details
              </h3>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <h4 className="text-foreground font-semibold">
                  Personal Information
                </h4>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">
                      First Name
                    </dt>
                    <dd className="text-foreground font-medium">
                      {payload.basic?.firstName || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">Last Name</dt>
                    <dd className="text-foreground font-medium">
                      {payload.basic?.lastName || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">Age</dt>
                    <dd className="text-foreground font-medium">
                      {payload.basic?.age || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">Gender</dt>
                    <dd className="text-foreground font-medium capitalize">
                      {payload.basic?.gender || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-foreground font-semibold">
                  Contact & Location
                </h4>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">
                      Phone Number
                    </dt>
                    <dd className="text-foreground font-medium">
                      {payload.phone || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">State</dt>
                    <dd className="text-foreground font-medium">
                      {payload.location?.state || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">LGA</dt>
                    <dd className="text-foreground font-medium">
                      {payload.location?.lga || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">Ward</dt>
                    <dd className="text-foreground font-medium">
                      {payload.location?.ward || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 sm:col-span-2">
                    <dt className="text-muted-foreground text-xs">
                      Polling Unit
                    </dt>
                    <dd className="text-foreground font-medium">
                      {payload.location?.pollingUnit || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-border/60 border-b">
              <h3 className="text-foreground text-lg font-semibold">
                Recent Activity
              </h3>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  {
                    icon: CheckCircle2,
                    title: "Registration Completed",
                    date: registrationDate,
                    color: "text-green-600",
                  },
                  {
                    icon: ClipboardList,
                    title: "Survey Submitted",
                    date: registrationDate,
                    color: "text-blue-600",
                  },
                  {
                    icon: Users,
                    title: "Candidate Selected",
                    date: registrationDate,
                    color: "text-purple-600",
                  },
                  {
                    icon: Shield,
                    title: "Phone Verified",
                    date: registrationDate,
                    color: "text-primary",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="border-border/60 bg-card flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div
                      className={cn(
                        "bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                        activity.color,
                      )}
                    >
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">
                        {activity.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
