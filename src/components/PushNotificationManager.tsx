import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface NotificationSettings {
  matches: boolean;
  messages: boolean;
  likes: boolean;
  propertyUpdates: boolean;
  marketing: boolean;
}

export function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    matches: true,
    messages: true,
    likes: true,
    propertyUpdates: false,
    marketing: false,
  });

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Push notifications are not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive push notifications for important updates.",
        });
        
        // Show a test notification
        new Notification('Welcome to Property Match!', {
          body: 'You\'ll receive notifications for matches, messages, and more.',
          icon: '/favicon.ico',
        });
      } else {
        toast({
          title: "Notifications blocked",
          description: "You can enable notifications later in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Here you would typically save to backend
    toast({
      title: "Settings updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Property Match.',
        icon: '/favicon.ico',
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Notifications Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support push notifications.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Stay updated with real-time notifications
          </p>
        </div>
      </div>

      {permission === 'default' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            Enable push notifications to get instant updates about matches, messages, and more.
          </p>
          <Button onClick={requestPermission} size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        </div>
      )}

      {permission === 'denied' && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            Notifications are blocked. You can enable them in your browser settings.
          </p>
        </div>
      )}

      {permission === 'granted' && (
        <>
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-800">
                Notifications are enabled! 🎉
              </p>
              <Button variant="outline" size="sm" onClick={sendTestNotification}>
                Test
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Notification Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Matches</p>
                  <p className="text-sm text-muted-foreground">
                    When you get a mutual match
                  </p>
                </div>
                <Switch
                  checked={settings.matches}
                  onCheckedChange={(checked) => updateSetting('matches', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Messages</p>
                  <p className="text-sm text-muted-foreground">
                    When someone sends you a message
                  </p>
                </div>
                <Switch
                  checked={settings.messages}
                  onCheckedChange={(checked) => updateSetting('messages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Likes</p>
                  <p className="text-sm text-muted-foreground">
                    When someone likes your profile or property
                  </p>
                </div>
                <Switch
                  checked={settings.likes}
                  onCheckedChange={(checked) => updateSetting('likes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Property Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Price changes and new properties
                  </p>
                </div>
                <Switch
                  checked={settings.propertyUpdates}
                  onCheckedChange={(checked) => updateSetting('propertyUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing</p>
                  <p className="text-sm text-muted-foreground">
                    Tips, promotions, and app updates
                  </p>
                </div>
                <Switch
                  checked={settings.marketing}
                  onCheckedChange={(checked) => updateSetting('marketing', checked)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}