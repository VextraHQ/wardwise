"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Phone,
  Clock,
  Star,
  TrendingUp,
  Eye,
  Download,
  Share2,
  AlertTriangle,
  Wifi,
  WifiOff,
  FileText,
  Lock,
  Unlock,
  BarChart3,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegistration } from "@/hooks/use-registration";
import { generateRegistrationId } from "@/lib/registration-schemas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VoterProfile() {
  const router = useRouter();
  const { payload, reset } = useRegistration();
  const [canEdit, _setCanEdit] = useState(true); // In production, check if within 7 days
  const [isOnline, _setIsOnline] = useState(true);
  const [_lastSync, _setLastSync] = useState(new Date());

  const fullName =
    `${payload.basic?.firstName || ""} ${payload.basic?.lastName || ""}`.trim();
  const registrationDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate days remaining for editing
  const daysRemaining = canEdit ? 7 : 0;
  const isLocked = !canEdit;

  const handleLogout = () => {
    reset();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleDownloadData = () => {
    // NDPA compliance - allow users to download their data
    const userData = {
      personalInfo: payload.basic,
      location: payload.location,
      phone: payload.phone,
      registrationDate,
      lastUpdated: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wardwise-data-${fullName.replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Your data has been downloaded");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Network Status Alert */}
      {!isOnline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You're offline. Your data is saved locally and will sync when you're
            back online.
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Status Banner */}
      <Alert
        className={cn(
          "border-2",
          isLocked
            ? "border-red-200 bg-red-50"
            : "border-green-200 bg-green-50",
        )}
      >
        {isLocked ? (
          <Lock className="h-4 w-4 text-red-600" />
        ) : (
          <Unlock className="h-4 w-4 text-green-600" />
        )}
        <AlertDescription
          className={cn(isLocked ? "text-red-800" : "text-green-800")}
        >
          {isLocked
            ? "Profile locked for election integrity. Contact support if you need changes."
            : `You can edit your profile for ${daysRemaining} more days. After that, it's locked until the next election cycle.`}
        </AlertDescription>
      </Alert>

      {/* Modern Profile Header */}
      <div className="from-primary/5 via-background to-primary/5 relative overflow-hidden rounded-2xl bg-gradient-to-br p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(70,194,167,0.1),transparent_50%)]"></div>

        <div className="relative flex flex-col items-center space-y-6 text-center lg:flex-row lg:items-start lg:space-y-0 lg:space-x-8 lg:text-left">
          {/* Avatar Section */}
          <div className="relative">
            <div className="bg-primary/10 ring-primary/20 flex h-24 w-24 items-center justify-center rounded-full ring-4">
              <span className="text-primary text-2xl font-bold">
                {getInitials(fullName || "Voter")}
              </span>
            </div>
            <div className="ring-background absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h1 className="text-foreground text-3xl font-bold tracking-tight lg:text-4xl">
                {fullName || "Voter Profile"}
              </h1>
              <p className="text-muted-foreground text-lg">
                Registered Voter • {payload.location?.state || "Adamawa State"}
              </p>
              <p className="text-muted-foreground text-sm">
                Registration ID: {generateRegistrationId(payload)}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {registrationDate}
              </Badge>
              {canEdit ? (
                <Badge variant="default" className="gap-1">
                  <Edit className="h-3 w-3" />
                  Editable ({daysRemaining} days left)
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 lg:grid-cols-4">
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className="text-primary text-lg font-bold">100%</div>
                <div className="text-muted-foreground text-xs">Complete</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className="text-primary text-lg font-bold">3/3</div>
                <div className="text-muted-foreground text-xs">Survey</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className="text-primary text-lg font-bold">1</div>
                <div className="text-muted-foreground text-xs">Candidate</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className="text-primary text-lg font-bold">✓</div>
                <div className="text-muted-foreground text-xs">Verified</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 lg:flex-row">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadData}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">My Profile</TabsTrigger>
          <TabsTrigger value="details">Full Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="privacy">Data &amp; Privacy</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Clean Profile Focus */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Personal Information Card */}
            <Card className="border-border bg-card">
              <CardHeader className="border-border border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <User className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">
                        Personal Information
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Your basic details
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">Full Name</p>
                      <p className="text-foreground font-medium">
                        {fullName || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">Age</p>
                      <p className="text-foreground font-medium">
                        {payload.basic?.age || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">Gender</p>
                      <p className="text-foreground font-medium capitalize">
                        {payload.basic?.gender || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">Phone</p>
                      <p className="text-foreground font-medium">
                        {payload.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voting Location Card */}
            <Card className="border-border bg-card">
              <CardHeader className="border-border border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <MapPin className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">
                        Your Voting Location
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Where you vote
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">State</p>
                      <p className="text-foreground font-medium">
                        {payload.location?.state || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">LGA</p>
                      <p className="text-foreground font-medium">
                        {payload.location?.lga || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">Ward</p>
                      <p className="text-foreground font-medium">
                        {payload.location?.ward || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">
                        Polling Unit
                      </p>
                      <p className="text-foreground font-medium">
                        {payload.location?.pollingUnit || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Support Card */}
            <Card className="border-border bg-card">
              <CardHeader className="border-border border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Users className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">
                        Your Support
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Your candidate choice
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Change
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
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
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-foreground font-semibold">
                        2,847
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  View Candidate Profile
                </Button>
              </CardContent>
            </Card>

            {/* Survey Status Card */}
            <Card className="border-border bg-card">
              <CardHeader className="border-border border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <ClipboardList className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      Survey Status
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Your responses
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Survey Completed
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Questions Answered
                      </span>
                      <span className="text-foreground font-semibold">
                        3 of 3
                      </span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  View Survey Responses
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Important Notice */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-4 py-6">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Shield className="text-primary h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-semibold">
                  Data Protection Notice
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
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
          <Card className="border-border bg-card">
            <CardHeader className="border-border border-b">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <User className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    Complete Registration Details
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    All your registration information
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-6">
                <h4 className="text-foreground flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">
                      First Name
                    </dt>
                    <dd className="text-foreground font-medium">
                      {payload.basic?.firstName || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">
                      Last Name
                    </dt>
                    <dd className="text-foreground font-medium">
                      {payload.basic?.lastName || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">Age</dt>
                    <dd className="text-foreground font-medium">
                      {payload.basic?.age || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">
                      Gender
                    </dt>
                    <dd className="text-foreground font-medium capitalize">
                      {payload.basic?.gender || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </div>

              <Separator />

              <div className="space-y-6">
                <h4 className="text-foreground flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4" />
                  Contact &amp; Location
                </h4>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">
                      Phone Number
                    </dt>
                    <dd className="text-foreground font-medium">
                      {payload.phone || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">
                      State
                    </dt>
                    <dd className="text-foreground font-medium">
                      {payload.location?.state || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">LGA</dt>
                    <dd className="text-foreground font-medium">
                      {payload.location?.lga || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <dt className="text-muted-foreground mb-1 text-xs">Ward</dt>
                    <dd className="text-foreground font-medium">
                      {payload.location?.ward || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 sm:col-span-2">
                    <dt className="text-muted-foreground mb-1 text-xs">
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
          <Card className="border-border bg-card">
            <CardHeader className="border-border border-b">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Clock className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    Recent Activity
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your registration timeline
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  {
                    icon: CheckCircle2,
                    title: "Registration Completed",
                    date: registrationDate,
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                  },
                  {
                    icon: ClipboardList,
                    title: "Survey Submitted",
                    date: registrationDate,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                  },
                  {
                    icon: Users,
                    title: "Candidate Selected",
                    date: registrationDate,
                    color: "text-purple-600",
                    bgColor: "bg-purple-50",
                  },
                  {
                    icon: Shield,
                    title: "Phone Verified",
                    date: registrationDate,
                    color: "text-primary",
                    bgColor: "bg-primary/10",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="border-border bg-card flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                        activity.bgColor,
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
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Privacy Tab - NDPA Compliance */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Data Rights */}
            <Card className="border-border bg-card">
              <CardHeader className="border-border border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <FileText className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Your Data Rights
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      NDPA compliant data management
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Data Collection
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Transparent
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Data Storage
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Encrypted
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Data Sharing
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Restricted
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleDownloadData}
                >
                  <Download className="h-4 w-4" />
                  Download My Data
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-border bg-card">
              <CardHeader className="border-border border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Shield className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Privacy Settings
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Control your data visibility
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Profile Visibility
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <Eye className="h-3 w-3" />
                      Public
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Survey Responses
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Anonymous
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Contact Information
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Private
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive w-full gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Request Data Deletion
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Data Protection Notice */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-4 py-6">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Shield className="text-primary h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-semibold">
                  Data Protection Notice
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your information is protected by Nigerian Data Protection Act
                  (NDPA) 2023. We use encryption, secure servers, and strict
                  access controls. Your data is never sold to third parties and
                  is only used for election-related purposes. You have the right
                  to access, correct, or delete your data at any time.
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Privacy Policy
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Terms of Service
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Community Voice Section - WardWise Differentiator */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="space-y-3 text-center">
          <div className="bg-primary/10 inline-flex items-center gap-2 rounded-full px-4 py-2">
            <BarChart3 className="text-primary h-4 w-4" />
            <span className="text-primary text-sm font-semibold">
              WardWise Community Voice
            </span>
          </div>
          <h2 className="text-foreground text-3xl font-bold">
            {payload.location?.ward || "Your Ward"} Community Voice
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            See what matters most to your neighbors and how your voice fits in.
            This is what makes WardWise different - real community insights.
          </p>
        </div>

        {/* Community Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Priority */}
          <Card className="border-border bg-card">
            <CardHeader className="border-border border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <BarChart3 className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">
                    Top Priority
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    What your ward cares about most
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Jobs &amp; Economy
                  </span>
                  <span className="text-muted-foreground text-sm">68%</span>
                </div>
                <Progress value={68} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Education</span>
                  <span className="text-muted-foreground text-sm">45%</span>
                </div>
                <Progress value={45} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Healthcare</span>
                  <span className="text-muted-foreground text-sm">32%</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Your Voice */}
          <Card className="border-border bg-card">
            <CardHeader className="border-border border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Heart className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">Your Voice</h3>
                  <p className="text-muted-foreground text-sm">
                    How you compare to your ward
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2 text-center">
                <div className="text-primary text-2xl font-bold">Education</div>
                <p className="text-muted-foreground text-sm">
                  You prioritize education, while 68% of your ward prioritizes
                  jobs
                </p>
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  Unique Perspective
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ward Activity */}
          <Card className="border-border bg-card">
            <CardHeader className="border-border border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Users className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">
                    Ward Activity
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Community engagement
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Registered Voters</span>
                  <span className="font-semibold">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Survey Responses</span>
                  <span className="font-semibold">1,923</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active This Week</span>
                  <span className="font-semibold">156</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Insights */}
        <Card className="border-border bg-card">
          <CardHeader className="border-border border-b">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <TrendingUp className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-lg font-semibold">
                  Community Insights
                </h3>
                <p className="text-muted-foreground text-sm">
                  What's happening in your ward
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                <TrendingUp className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Education support is growing
                  </p>
                  <p className="text-sm text-green-700">
                    +12% more people prioritizing education this week
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                <Users className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">
                    High engagement in your area
                  </p>
                  <p className="text-sm text-blue-700">
                    Your ward has 67% survey completion rate (above average)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
