"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  HiShieldCheck,
  HiEyeOff,
  HiBell,
  HiMail,
  HiLogout,
  HiCheckCircle,
  HiLockClosed,
  HiDeviceMobile,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/**
 * TODO: [BACKEND] Settings API
 * - GET /api/voters/:nin/settings - load current settings
 * - PATCH /api/voters/:nin/settings - update settings
 * - Settings should persist and sync with notification system
 */

/**
 * TODO: [SYNC] Candidate Dashboard Integration
 * - Notification preferences affect what candidates can send
 * - If voter disables campaign updates, candidates see reduced reach
 * - Consider showing this to candidates in their analytics
 */

/**
 * TODO: [FEATURE] Account deletion
 * - During election period: show lockdown message
 * - Post-election: allow data removal request
 * - NDPA 2023 compliance for data portability
 */

interface SettingsTabProps {
  onLogout: () => void;
}

export function SettingsTab({ onLogout }: SettingsTabProps) {
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [campaignUpdates, setCampaignUpdates] = useState(true);
  const [surveyNotifications, setSurveyNotifications] = useState(true);

  // Track if settings changed
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    value: boolean,
  ) => {
    setter(value);
    setIsDirty(true);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      /**
       * TODO: [BACKEND] Save settings to API
       * - POST /api/voters/:nin/settings
       * - Include all notification preferences
       */
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved");
      setIsDirty(false);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />
        <div className="border-primary/30 absolute top-0 right-0 size-3 border-t border-r" />

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-primary/5 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
              <HiBell className="size-4" />
            </div>
            <div>
              <h3 className="text-foreground text-xs font-bold tracking-tight uppercase sm:text-sm">
                Notifications
              </h3>
              <p className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase">
                Communication Preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-muted/50 flex size-7 items-center justify-center rounded">
                  <HiMail className="text-muted-foreground size-3.5" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">
                    Email Notifications
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(v) => handleToggle(setEmailNotifications, v)}
              />
            </div>

            {/* SMS Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-muted/50 flex size-7 items-center justify-center rounded">
                  <HiDeviceMobile className="text-muted-foreground size-3.5" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">
                    SMS Notifications
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Receive updates via text message
                  </p>
                </div>
              </div>
              <Switch
                checked={smsNotifications}
                onCheckedChange={(v) => handleToggle(setSmsNotifications, v)}
              />
            </div>

            <div className="border-border/40 border-t pt-4">
              {/* Campaign Updates */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <Label className="text-xs font-semibold">
                    Campaign Updates
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    News and updates from your candidates
                  </p>
                </div>
                <Switch
                  checked={campaignUpdates}
                  onCheckedChange={(v) => handleToggle(setCampaignUpdates, v)}
                />
              </div>

              {/* Survey Notifications */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="text-xs font-semibold">Survey Alerts</Label>
                  <p className="text-muted-foreground text-xs">
                    Get notified about new surveys
                  </p>
                </div>
                <Switch
                  checked={surveyNotifications}
                  onCheckedChange={(v) =>
                    handleToggle(setSurveyNotifications, v)
                  }
                />
              </div>
            </div>

            {/* Save button */}
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end pt-2"
              >
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="h-8 gap-2 rounded-lg px-4 text-xs font-bold tracking-widest uppercase"
                >
                  {isSaving ? (
                    <>
                      <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="size-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-primary/5 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
              <HiShieldCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-foreground text-xs font-bold tracking-tight uppercase sm:text-sm">
                Privacy & Security
              </h3>
              <p className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase">
                NDPA 2023 Protected
              </p>
            </div>
          </div>

          {/* Privacy Status Grid */}
          <div className="bg-muted/20 mb-3 grid gap-2 rounded-lg p-3 sm:grid-cols-3">
            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
              <span className="text-muted-foreground text-xs">Profile</span>
              <Badge
                variant="secondary"
                className="h-5 gap-1 px-1.5 text-[10px] font-bold"
              >
                <HiEyeOff className="size-2" />
                Private
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
              <span className="text-muted-foreground text-xs">
                Survey Responses
              </span>
              <Badge
                variant="secondary"
                className="h-5 gap-1 px-1.5 text-[10px] font-bold"
              >
                <HiLockClosed className="size-2" />
                Anonymous
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
              <span className="text-muted-foreground text-xs">
                Contact Info
              </span>
              <Badge
                variant="secondary"
                className="h-5 gap-1 px-1.5 text-[10px] font-bold"
              >
                <HiEyeOff className="size-2" />
                Hidden
              </Badge>
            </div>
          </div>

          {/* Your Rights */}
          <div className="text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2">
              <HiCheckCircle className="text-primary size-3 shrink-0" />
              <span className="text-xs">Access your data anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <HiCheckCircle className="text-primary size-3 shrink-0" />
              <span className="text-xs">Data portability upon request</span>
            </div>
            <div className="flex items-center gap-2">
              <HiCheckCircle className="text-primary size-3 shrink-0" />
              <span className="text-xs">
                Request data removal (post-election)
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Logout Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-border/60 bg-card relative overflow-hidden border p-4 sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-foreground text-xs font-bold tracking-tight uppercase">
              Session
            </h3>
            <p className="text-muted-foreground text-xs">
              Sign out of your account
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 h-9 gap-2 rounded-lg text-xs font-bold tracking-widest uppercase"
          >
            <HiLogout className="size-4" />
            Logout
          </Button>
        </div>

        {/**
         * TODO: [FEATURE] Account deletion during election
         * - Check election period status from backend
         * - If active: show lockdown message (current)
         * - If post-election: show data removal request button
         */}
        <p className="text-muted-foreground/60 mt-3 text-xs">
          <HiLockClosed className="mr-1 inline size-2.5" />
          Account deletion is not available during the election period to
          maintain voter registry integrity. For data removal requests, please
          contact support after the election concludes.
        </p>
      </motion.div>
    </div>
  );
}
