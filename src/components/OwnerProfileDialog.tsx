
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface OwnerProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerProfileDialog({ open, onOpenChange }: OwnerProfileDialogProps) {
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white/10 backdrop-blur border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Owner Profile</DialogTitle>
          <DialogDescription className="text-white/70">
            Manage your profile information. This is a placeholder view.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-white/90">Email</Label>
            <Input value={user?.email ?? ''} readOnly className="bg-white/5 border-white/20 text-white" />
          </div>
          <div className="grid gap-2">
            <Label className="text-white/90">Display name</Label>
            <Input placeholder="Your name" className="bg-white/5 border-white/20 text-white" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
