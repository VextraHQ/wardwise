"use client";

import { CheckCircle2, Shield, Users, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function CompletePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/wardwise-logo.svg"
                alt="WardWise"
                width={150}
                height={28}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4" />
              <span>Secure • Encrypted • Verified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="mb-2 text-3xl font-bold text-slate-900">
              Registration Complete!
            </CardTitle>
            <p className="text-lg text-slate-600">
              Thank you for registering with WardWise. Your voice matters.
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Success Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-slate-900">
                    Phone Verified
                  </div>
                  <div className="text-sm text-slate-600">
                    Your number is confirmed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-slate-900">
                    Location Recorded
                  </div>
                  <div className="text-sm text-slate-600">
                    Polling unit identified
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Users className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-slate-900">
                    Candidate Notified
                  </div>
                  <div className="text-sm text-slate-600">
                    Your support is shared
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Shield className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-slate-900">Data Secured</div>
                  <div className="text-sm text-slate-600">
                    Encrypted & protected
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-emerald-900">
                <Clock className="h-5 w-5" />
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li>
                  • Your chosen candidate can now see your registration in their
                  dashboard
                </li>
                <li>
                  • You may receive SMS updates about campaign events and
                  opportunities
                </li>
                <li>
                  • Your priorities and concerns help shape campaign strategies
                </li>
                <li>
                  • Your data remains secure and is only shared with your chosen
                  candidate
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 hover:from-emerald-700 hover:to-emerald-800"
              >
                <Link href="/">Return Home</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8">
                <Link href="/register">Register Another Voter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
