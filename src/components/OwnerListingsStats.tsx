import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Eye, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface OwnerListingsStatsProps {
  listings: any[];
}

export function OwnerListingsStats({ listings }: OwnerListingsStatsProps) {
  // Calculate statistics
  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'active' && l.is_active).length;
  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const totalValue = listings.reduce((sum, l) => sum + (l.price || 0), 0);

  // Calculate average price
  const avgPrice = totalListings > 0 ? totalValue / totalListings : 0;

  // Count by category
  const propertiesCount = listings.filter(l => !l.category || l.category === 'property').length;
  const motorcyclesCount = listings.filter(l => l.category === 'motorcycle').length;
  const bicyclesCount = listings.filter(l => l.category === 'bicycle').length;
  const yachtsCount = listings.filter(l => l.category === 'yacht').length;

  const stats = [
    {
      title: 'Total Listings',
      value: totalListings,
      icon: Home,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${activeListings} active`
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'All time'
    },
    {
      title: 'Avg. Price',
      value: `$${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Per listing'
    },
    {
      title: 'Categories',
      value: [propertiesCount, motorcyclesCount, bicyclesCount, yachtsCount].filter(c => c > 0).length,
      icon: Activity,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Active types'
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
