import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useMessageActivations } from "@/hooks/useMessageActivations";
import { useState } from "react";
import { MessageActivationPackages } from "./MessageActivationPackages";

export function MessageQuotaDisplay() {
  const { totalActivations, canSendMessage, isLoading } = useMessageActivations();
  const [showPackages, setShowPackages] = useState(false);

  if (isLoading) return null;

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/20">
        <MessageCircle className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium">
          {totalActivations} message {totalActivations === 1 ? 'activation' : 'activations'} remaining
        </span>
        <Button 
          size="sm" 
          variant="default"
          onClick={() => setShowPackages(true)}
          className="ml-2"
        >
          {canSendMessage ? 'Buy More' : 'Get Activations'}
        </Button>
      </div>
      
      <MessageActivationPackages 
        isOpen={showPackages}
        onClose={() => setShowPackages(false)}
      />
    </>
  );
}
