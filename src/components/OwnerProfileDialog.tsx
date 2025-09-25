
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface OwnerProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerProfileDialog({ open, onOpenChange }: OwnerProfileDialogProps) {
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader className="px-6 py-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Owner Profile
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Manage your property owner profile information and settings.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90">Basic Information</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-white/90">Email Address</Label>
                  <Input 
                    value={user?.email ?? ''} 
                    readOnly 
                    className="bg-white/5 border-white/20 text-white/60 cursor-not-allowed" 
                  />
                  <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <Label className="text-white/90">Display Name</Label>
                  <Input 
                    placeholder="Your full name" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400" 
                  />
                </div>
                
                <div>
                  <Label className="text-white/90">Phone Number</Label>
                  <Input 
                    placeholder="+1 (555) 123-4567" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400" 
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90">Company Information</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-white/90">Company Name</Label>
                  <Input 
                    placeholder="Your real estate company" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400" 
                  />
                </div>
                
                <div>
                  <Label className="text-white/90">License Number</Label>
                  <Input 
                    placeholder="Real estate license number" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400" 
                  />
                </div>
                
                <div>
                  <Label className="text-white/90">Business Address</Label>
                  <Textarea 
                    placeholder="Your business address" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90">About Your Business</h3>
              
              <div>
                <Label className="text-white/90">Bio</Label>
                <Textarea 
                  placeholder="Tell potential tenants about your experience, property management style, and what makes you a great landlord..." 
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400 resize-none min-h-[120px]"
                  maxLength={500}
                />
                <p className="text-white/40 text-xs mt-1">0/500 characters</p>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90">Communication Preferences</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-white/90">Preferred Contact Method</Label>
                  <Input 
                    placeholder="Email, Phone, SMS" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400" 
                  />
                </div>
                
                <div>
                  <Label className="text-white/90">Response Time</Label>
                  <Input 
                    placeholder="e.g., Within 24 hours" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400" 
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-white/10 flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
