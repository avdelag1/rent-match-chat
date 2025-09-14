import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientStats } from '@/hooks/useClientStats';
import { Heart, MessageCircle, Eye, TrendingUp } from 'lucide-react';

export function ClientStatsCard() {
  const { data: stats, isLoading } = useClientStats();

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Loading your activity...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Your Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xl font-bold text-primary">{stats?.savedProperties || 0}</span>
            </div>
            <p className="text-white/60 text-sm">Saved Properties</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xl font-bold text-primary">{stats?.activeConversations || 0}</span>
            </div>
            <p className="text-white/60 text-sm">Active Chats</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xl font-bold text-primary">{stats?.totalMatches || 0}</span>
            </div>
            <p className="text-white/60 text-sm">Total Matches</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-xl font-bold text-primary">{stats?.matchRate || 0}%</span>
            </div>
            <p className="text-white/60 text-sm">Match Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}