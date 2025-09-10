import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, Calendar, TrendingUp, Users } from 'lucide-react';

interface Match {
  id: string;
  name: string;
  image?: string;
  type: 'property' | 'client';
  status: 'pending' | 'mutual' | 'expired';
  matchedAt: Date;
  lastActivity?: Date;
  score?: number;
}

interface MatchHistoryProps {
  userRole: 'client' | 'owner';
}

export function MatchHistory({ userRole }: MatchHistoryProps) {
  const [matches] = useState<Match[]>([
    {
      id: '1',
      name: 'Luxury Beachfront Villa',
      type: 'property',
      status: 'mutual',
      matchedAt: new Date('2024-01-15'),
      lastActivity: new Date('2024-01-16'),
      score: 95
    },
    {
      id: '2',
      name: 'John Rodriguez',
      type: 'client', 
      status: 'pending',
      matchedAt: new Date('2024-01-14'),
      score: 88
    },
    {
      id: '3',
      name: 'Modern Studio Downtown',
      type: 'property',
      status: 'expired',
      matchedAt: new Date('2024-01-10'),
      score: 76
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mutual': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'mutual': return 'Matched';
      case 'pending': return 'Pending';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const mutualMatches = matches.filter(m => m.status === 'mutual');
  const pendingMatches = matches.filter(m => m.status === 'pending');
  const expiredMatches = matches.filter(m => m.status === 'expired');

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={match.image} />
            <AvatarFallback className="bg-primary text-white">
              {match.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-white truncate">{match.name}</h4>
              <Badge className={`${getStatusColor(match.status)} text-white text-xs`}>
                {getStatusText(match.status)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {match.matchedAt.toLocaleDateString()}
              </span>
              {match.score && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {match.score}% match
                </span>
              )}
            </div>
            
            {match.lastActivity && (
              <p className="text-xs text-white/50 mt-1">
                Last activity: {match.lastActivity.toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {match.status === 'mutual' && (
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Match History</h2>
        <p className="text-white/70">Track your connections and interactions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto text-red-400 mb-2" />
            <div className="text-2xl font-bold text-white">{mutualMatches.length}</div>
            <div className="text-white/60 text-sm">Mutual Matches</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white">{pendingMatches.length}</div>
            <div className="text-white/60 text-sm">Pending</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              {matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + (m.score || 0), 0) / matches.length) : 0}%
            </div>
            <div className="text-white/60 text-sm">Avg Match Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Match Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
          <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/20">
            All ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="mutual" className="text-white data-[state=active]:bg-white/20">
            Mutual ({mutualMatches.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-white data-[state=active]:bg-white/20">
            Pending ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="text-white data-[state=active]:bg-white/20">
            Expired ({expiredMatches.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-3 mt-6">
          {matches.map(match => <MatchCard key={match.id} match={match} />)}
        </TabsContent>
        
        <TabsContent value="mutual" className="space-y-3 mt-6">
          {mutualMatches.map(match => <MatchCard key={match.id} match={match} />)}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-3 mt-6">
          {pendingMatches.map(match => <MatchCard key={match.id} match={match} />)}
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-3 mt-6">
          {expiredMatches.map(match => <MatchCard key={match.id} match={match} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}