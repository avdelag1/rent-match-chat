import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/hooks/useListings';
import { Eye, TrendingUp, Clock, Users, MapPin, DollarSign, Calendar } from 'lucide-react';

interface SwipeInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
}

export function SwipeInsightsModal({ open, onOpenChange, listing }: SwipeInsightsModalProps) {
  if (!listing) return null;

  // Mock insights data - in production, fetch from API
  const insights = {
    views: Math.floor(Math.random() * 500) + 100,
    saves: Math.floor(Math.random() * 50) + 10,
    shares: Math.floor(Math.random() * 20) + 2,
    responseRate: Math.floor(Math.random() * 30) + 70,
    avgResponseTime: Math.floor(Math.random() * 24) + 1,
    popularityScore: Math.floor(Math.random() * 3) + 7,
    viewsLastWeek: Math.floor(Math.random() * 200) + 50,
    demandLevel: Math.random() > 0.5 ? 'high' : 'medium',
    priceVsMarket: Math.floor((Math.random() * 20) - 10)
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="w-6 h-6 text-primary" />
                  Property Insights
                </DialogTitle>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Property Summary */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.neighborhood}, {listing.city}</span>
                  </div>
                </div>

                {/* View Statistics */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    View Statistics
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Views" value={insights.views} icon="👁️" />
                    <StatCard label="Saves" value={insights.saves} icon="💾" />
                    <StatCard label="Shares" value={insights.shares} icon="🔗" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>+{insights.viewsLastWeek} views in the last 7 days</span>
                  </div>
                </div>

                {/* Response Rate */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Owner Response
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                        {insights.responseRate}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${insights.responseRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Typically responds within {insights.avgResponseTime} hour{insights.avgResponseTime > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Popularity Score */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Popularity & Demand
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {insights.popularityScore}
                        </span>
                        <span className="text-sm text-muted-foreground">/ 10</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Popularity Score</p>
                    </div>
                    <Badge className={`
                      ${insights.demandLevel === 'high' 
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400' 
                        : 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                      }
                    `}>
                      {insights.demandLevel === 'high' ? '🔥 High Demand' : '📈 Medium Demand'}
                    </Badge>
                  </div>
                </div>

                {/* Price Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Price Analysis
                  </h4>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">vs. Market Average</span>
                      <Badge className={`
                        ${insights.priceVsMarket < 0 
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                          : 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                        }
                      `}>
                        {insights.priceVsMarket > 0 ? '+' : ''}{insights.priceVsMarket}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insights.priceVsMarket < 0 
                        ? `This property is priced ${Math.abs(insights.priceVsMarket)}% below market average - great value!`
                        : `This property is priced ${insights.priceVsMarket}% above market average.`
                      }
                    </p>
                  </div>
                </div>

                {/* Availability Indicator */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Availability
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-medium">Currently Available</p>
                        <p className="text-xs text-muted-foreground">Last updated 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="p-3 bg-muted/50 rounded-xl text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
