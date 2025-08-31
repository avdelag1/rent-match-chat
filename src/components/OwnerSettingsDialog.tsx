
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface OwnerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerSettingsDialog({ open, onOpenChange }: OwnerSettingsDialogProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white/10 backdrop-blur border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Owner Settings</DialogTitle>
          <DialogDescription className="text-white/70">
            Basic settings placeholder so the menu actually opens something. More options coming soon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Email notifications</span>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <span>Dark mode</span>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
