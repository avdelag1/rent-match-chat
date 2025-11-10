import { useMonthlyMessageLimits } from '@/hooks/useMonthlyMessageLimits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap } from 'lucide-react';

interface MonthlyMessageLimitIndicatorProps {
  showIfNoLimit?: boolean;
}

export function MonthlyMessageLimitIndicator({ showIfNoLimit = false }: MonthlyMessageLimitIndicatorProps) {
  const { messagesUsed, messagesRemaining, messageLimit, isAtLimit, limitPercentage, hasMonthlyLimit, isLoading } = useMonthlyMessageLimits();

  if (!hasMonthlyLimit || isLoading) {
    return null;
  }

  if (messageLimit === 0 && !showIfNoLimit) {
    return null;
  }

  const isWarning = limitPercentage >= 75;
  const isWarningColor = isAtLimit ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <Card className={`border ${isAtLimit ? 'border-red-500/50 bg-red-500/5' : isWarning ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${isAtLimit ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-blue-500'}`} />
            Monthly Messages
          </div>
          <Badge
            variant={isAtLimit ? 'destructive' : isWarning ? 'secondary' : 'outline'}
            className={isAtLimit ? '' : ''}
          >
            {messagesRemaining}/{messageLimit}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={limitPercentage} className="h-2" />

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Used this month:</span>
            <span className="font-medium">{messagesUsed} messages</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining:</span>
            <span className={`font-medium ${isAtLimit ? 'text-red-600 dark:text-red-400' : ''}`}>
              {messagesRemaining} messages
            </span>
          </div>
        </div>

        {isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-600 dark:text-red-400">
              You've reached your monthly message limit. Upgrade or wait until next month to send more messages.
            </div>
          </div>
        )}

        {isWarning && !isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              You're using most of your monthly messages. Consider upgrading for unlimited access.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
