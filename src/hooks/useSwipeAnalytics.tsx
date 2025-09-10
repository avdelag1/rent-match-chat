import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SwipeMetrics {
  totalSwipes: number;
  likesGiven: number;
  passesGiven: number;
  superLikesGiven: number;
  matchRate: number;
  averageSessionTime: number;
  peakActivity: string;
  topCategories: string[];
}

interface SwipePattern {
  timeOfDay: string;
  dayOfWeek: string;
  swipeDirection: 'left' | 'right';
  targetType: 'property' | 'client';
  sessionDuration: number;
}

export function useSwipeAnalytics(userRole: 'client' | 'owner') {
  const [sessionStart] = useState(Date.now());
  const [swipeSession, setSwipeSession] = useState<SwipePattern[]>([]);

  // Track swipe patterns
  const trackSwipe = (direction: 'left' | 'right', targetType: 'property' | 'client') => {
    const pattern: SwipePattern = {
      timeOfDay: new Date().getHours().toString(),
      dayOfWeek: new Date().getDay().toString(),
      swipeDirection: direction,
      targetType,
      sessionDuration: Date.now() - sessionStart
    };

    setSwipeSession(prev => [...prev, pattern]);
    
    // Store in local storage for persistence
    const stored = localStorage.getItem('swipePatterns') || '[]';
    const patterns = JSON.parse(stored);
    patterns.push(pattern);
    
    // Keep only last 1000 patterns
    if (patterns.length > 1000) {
      patterns.splice(0, patterns.length - 1000);
    }
    
    localStorage.setItem('swipePatterns', JSON.stringify(patterns));
  };

  // Get swipe metrics
  const { data: metrics } = useQuery({
    queryKey: ['swipe-metrics', userRole],
    queryFn: async (): Promise<SwipeMetrics> => {
      const stored = localStorage.getItem('swipePatterns') || '[]';
      const patterns: SwipePattern[] = JSON.parse(stored);
      
      const today = patterns.filter(p => {
        const patternDate = new Date();
        const today = new Date();
        return patternDate.toDateString() === today.toDateString();
      });

      const totalSwipes = today.length;
      const likesGiven = today.filter(p => p.swipeDirection === 'right').length;
      const passesGiven = today.filter(p => p.swipeDirection === 'left').length;
      
      // Mock super likes and matches for demo
      const superLikesGiven = Math.floor(likesGiven * 0.1);
      const matchRate = likesGiven > 0 ? Math.floor(Math.random() * 30 + 10) : 0;
      
      // Calculate average session time
      const sessions = patterns.reduce((acc, pattern) => {
        const hour = pattern.timeOfDay;
        if (!acc[hour]) acc[hour] = [];
        acc[hour].push(pattern.sessionDuration);
        return acc;
      }, {} as Record<string, number[]>);
      
      const avgSessionTime = Object.values(sessions).flat().reduce((a, b) => a + b, 0) / 
                            Math.max(Object.values(sessions).flat().length, 1);

      // Find peak activity hour
      const hourCounts = patterns.reduce((acc, pattern) => {
        acc[pattern.timeOfDay] = (acc[pattern.timeOfDay] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const peakHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '12';
      
      const peakActivity = `${peakHour}:00`;
      
      // Top categories (mock data for demo)
      const topCategories = userRole === 'client' 
        ? ['Beachfront', 'Modern', 'Furnished', 'Pet-friendly']
        : ['Professionals', 'Long-term', 'Verified', 'Digital nomads'];

      return {
        totalSwipes,
        likesGiven,
        passesGiven,
        superLikesGiven,
        matchRate,
        averageSessionTime: Math.floor(avgSessionTime / 1000 / 60), // Convert to minutes
        peakActivity,
        topCategories
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get daily swipe breakdown
  const getDailyBreakdown = () => {
    const stored = localStorage.getItem('swipePatterns') || '[]';
    const patterns: SwipePattern[] = JSON.parse(stored);
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map(dateStr => {
      const dayPatterns = patterns.filter(p => {
        // This is simplified - in reality you'd need to store actual dates
        return true; // Mock data
      });
      
      return {
        date: dateStr,
        swipes: Math.floor(Math.random() * 50 + 10),
        likes: Math.floor(Math.random() * 25 + 5),
        matches: Math.floor(Math.random() * 5 + 1)
      };
    });
  };

  // Get insights and recommendations
  const getInsights = () => {
    const insights = [];
    
    if (!metrics) return insights;

    if (metrics.matchRate > 25) {
      insights.push({
        type: 'success',
        title: 'Great Match Rate!',
        message: `Your ${metrics.matchRate}% match rate is above average. Keep up the good work!`,
        action: 'Continue your current strategy'
      });
    } else if (metrics.matchRate < 10) {
      insights.push({
        type: 'tip',
        title: 'Improve Your Matches',
        message: 'Consider updating your profile or adjusting your search criteria.',
        action: 'Update preferences'
      });
    }

    if (metrics.totalSwipes > 100) {
      insights.push({
        type: 'warning',
        title: 'High Activity',
        message: 'You\'ve been very active today. Take breaks to make better decisions.',
        action: 'Take a break'
      });
    }

    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour <= 6) {
      insights.push({
        type: 'info',
        title: 'Off-Peak Hours',
        message: 'You get better responses during daytime hours (9 AM - 9 PM).',
        action: 'Try swiping during peak hours'
      });
    }

    return insights;
  };

  return {
    metrics,
    trackSwipe,
    getDailyBreakdown,
    getInsights,
    sessionPatterns: swipeSession
  };
}
