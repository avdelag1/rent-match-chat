
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface OwnerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerSettingsDialog({ open, onOpenChange }: OwnerSettingsDialogProps) {
  const [notifications, setNotifications] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white/10 backdrop-blur border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Owner Settings</DialogTitle>
          <DialogDescription className="text-white/70">
            Manage your account preferences and notification settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="space-y-1">
              <span className="font-medium">Email Notifications</span>
              <p className="text-sm text-white/60">Receive updates about new tenant applications and messages</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
