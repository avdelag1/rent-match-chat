
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';

interface OwnerClientSwipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerClientSwipeDialog({ open, onOpenChange }: OwnerClientSwipeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Discover Potential Clients</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <ClientSwipeContainer
            onClientTap={() => {}}
            onInsights={() => {}}
            onMessageClick={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OwnerClientSwipeDialog;
