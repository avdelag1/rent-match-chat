
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';

interface OwnerClientSwipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerClientSwipeDialog({ open, onOpenChange }: OwnerClientSwipeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <div className="relative w-full h-full">
          <ClientSwipeContainer
            onClientTap={() => {}}
            onInsights={() => {}}
            onMessageClick={() => {}}
            fullscreen={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OwnerClientSwipeDialog;
