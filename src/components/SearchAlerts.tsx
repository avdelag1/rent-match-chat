import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface SearchAlert {
  id: string;
  name: string;
  criteria: {
    priceMin?: number;
    priceMax?: number;
    location?: string;
    propertyType?: string;
    bedrooms?: number;
  };
  frequency: 'instant' | 'daily' | 'weekly';
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  isActive: boolean;
  lastTriggered?: Date;
  matchCount: number;
}

export function SearchAlerts() {
  const [alerts, setAlerts] = useState<SearchAlert[]>([
    {
      id: '1',
      name: 'Downtown Studio Alert',
      criteria: {
        priceMin: 800,
        priceMax: 1500,
        location: 'Downtown',
        propertyType: 'studio',
      },
      frequency: 'instant',
      channels: { email: true, push: true, sms: false },
      isActive: true,
      lastTriggered: new Date('2024-09-19'),
      matchCount: 3,
    },
    {
      id: '2',
      name: 'Beach House Watch',
      criteria: {
        priceMax: 3000,
        location: 'Beachfront',
        propertyType: 'house',
        bedrooms: 2,
      },
      frequency: 'daily',
      channels: { email: true, push: false, sms: true },
      isActive: false,
      lastTriggered: new Date('2024-09-15'),
      matchCount: 1,
    },
  ]);

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );
    
    const alert = alerts.find(a => a.id === id);
    toast({
      title: alert?.isActive ? "Alert paused" : "Alert activated",
      description: `"${alert?.name}" is now ${alert?.isActive ? 'inactive' : 'active'}.`,
    });
  };

  const updateChannel = (alertId: string, channel: keyof SearchAlert['channels'], enabled: boolean) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, channels: { ...alert.channels, [channel]: enabled } }
          : alert
      )
    );

    toast({
      title: "Notification settings updated",
      description: `${channel.toUpperCase()} notifications ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const formatCriteria = (criteria: SearchAlert['criteria']) => {
    const parts = [];
    
    if (criteria.priceMin || criteria.priceMax) {
      parts.push(`$${criteria.priceMin || 0}-${criteria.priceMax || '∞'}`);
    }
    if (criteria.location) parts.push(criteria.location);
    if (criteria.propertyType) parts.push(criteria.propertyType);
    if (criteria.bedrooms) parts.push(`${criteria.bedrooms} bed`);
    
    return parts.join(' • ');
  };

  const getFrequencyBadge = (frequency: SearchAlert['frequency']) => {
    const colors = {
      instant: 'bg-red-100 text-red-800',
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
    };
    
    return (
      <Badge className={colors[frequency]}>
        {frequency}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Search Alerts</h2>
          <p className="text-muted-foreground">
            Get notified when properties matching your criteria become available
          </p>
        </div>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No search alerts</h3>
          <p className="text-muted-foreground mb-4">
            Create alerts to get notified when new properties match your criteria.
          </p>
          <Button>Create Your First Alert</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{alert.name}</h3>
                    {getFrequencyBadge(alert.frequency)}
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatCriteria(alert.criteria)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {alert.matchCount} properties found
                    </span>
                    {alert.lastTriggered && (
                      <span>
                        Last triggered {alert.lastTriggered.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Notification Channels</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch
                      checked={alert.channels.email}
                      onCheckedChange={(checked) => updateChannel(alert.id, 'email', checked)}
                      disabled={!alert.isActive}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Push</span>
                    </div>
                    <Switch
                      checked={alert.channels.push}
                      onCheckedChange={(checked) => updateChannel(alert.id, 'push', checked)}
                      disabled={!alert.isActive}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch
                      checked={alert.channels.sms}
                      onCheckedChange={(checked) => updateChannel(alert.id, 'sms', checked)}
                      disabled={!alert.isActive}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}