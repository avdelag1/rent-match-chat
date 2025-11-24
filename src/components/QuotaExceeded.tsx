import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface QuotaExceededProps {
  type: 'messages' | 'properties' | 'documents';
  remaining?: number;
  limit?: number;
}

export function QuotaExceeded({ type, remaining = 0, limit = 0 }: QuotaExceededProps) {
  const navigate = useNavigate();

  const content = {
    messages: {
      title: "Message Limit Reached",
      description: "You've used all your message activations for this period. Upgrade to continue connecting with matches!",
      action: "View Plans"
    },
    properties: {
      title: "Property Limit Reached",
      description: `You've reached your limit of ${limit} active properties. Upgrade to list more!`,
      action: "Upgrade Plan"
    },
    documents: {
      title: "Document Quota Exceeded",
      description: "You've used all your legal document quotas. Upgrade for more!",
      action: "View Packages"
    }
  };

  const config = content[type];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-yellow-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>

      <p className="text-gray-600 mb-2 max-w-sm">
        {config.description}
      </p>

      {limit > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          Used: {limit - remaining} / {limit}
        </p>
      )}

      <Button
        onClick={() => navigate('/subscription-packages')}
        variant="default"
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {config.action}
      </Button>
    </div>
  );
}
