import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useMessageActivations } from "@/hooks/useMessageActivations";

export function MessageQuotaDisplay() {
  const { totalActivations, canSendMessage, isLoading } = useMessageActivations();
  const navigate = useNavigate();

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/20">
      <MessageCircle className="w-4 h-4 text-accent" />
      <span className="text-sm font-medium">
        {totalActivations} message {totalActivations === 1 ? 'activation' : 'activations'} remaining
      </span>
      {!canSendMessage && (
        <Button 
          size="sm" 
          variant="default"
          onClick={() => navigate('/subscription-packages')}
          className="ml-2"
        >
          Buy More
        </Button>
      )}
    </div>
  );
}
