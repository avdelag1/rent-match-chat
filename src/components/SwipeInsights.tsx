import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSwipeAnalytics } from '@/hooks/useSwipeAnalytics';
import { 
  TrendingUp, 
  Flame, 
  X, 
  Zap, 
  Clock, 
  Target,
  BarChart3,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SwipeInsightsProps {
  userRole: 'client' | 'owner';
  isOpen: boolean;
  onClose: () => void;
}

export function SwipeInsights({ userRole, isOpen, onClose }: SwipeInsightsProps) {
  const { metrics, getDailyBreakdown, getInsights } = useSwipeAnalytics(userRole);
  
  if (!isOpen) return null;

  const dailyData = getDailyBreakdown();
  const insights = getInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'tip': return <Target className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-white/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black/90 border-b border-white/20 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Swipe Analytics</h2>
            <Button variant="ghost" onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">{metrics?.totalSwipes || 0}</div>
                <div className="text-white/60 text-sm">Total Swipes</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 mx-auto text-red-400 mb-2" />
                <div className="text-2xl font-bold text-white">{metrics?.likesGiven || 0}</div>
                <div className="text-white/60 text-sm">Likes Given</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">{metrics?.matchRate || 0}%</div>
                <div className="text-white/60 text-sm">Match Rate</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">{metrics?.averageSessionTime || 0}m</div>
                <div className="text-white/60 text-sm">Avg Session</div>
              </CardContent>
            </Card>
          </div>

          {/* Match Rate Progress */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Match Rate Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Current Rate</span>
                  <span className="text-white font-bold">{metrics?.matchRate || 0}%</span>
                </div>
                <Progress value={metrics?.matchRate || 0} className="h-2" />
                <div className="flex justify-between text-sm text-white/60">
                  <span>0%</span>
                  <span>Target: 25%</span>
                  <span>50%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">7-Day Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-400">{day.swipes} swipes</span>
                      <span className="text-red-400">{day.likes} likes</span>
                      <span className="text-green-400">{day.matches} matches</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Activity */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Peak Activity Time</span>
                <Badge className="bg-primary text-white">{metrics?.peakActivity || '12:00'}</Badge>
              </div>
              
              <div>
                <span className="text-white/70 text-sm">Top Categories</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {metrics?.topCategories?.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights & Recommendations */}
          {insights.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Insights & Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{insight.title}</h4>
                      <p className="text-white/70 text-sm mb-2">{insight.message}</p>
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}