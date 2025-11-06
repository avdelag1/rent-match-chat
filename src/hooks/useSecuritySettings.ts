import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface SecuritySettings {
  two_factor_enabled: boolean;
  login_alerts: boolean;
  session_timeout: boolean;
  device_tracking: boolean;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  two_factor_enabled: false,
  login_alerts: true,
  session_timeout: true,
  device_tracking: true,
};

export function useSecuritySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchSettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, use defaults
          setSettings(DEFAULT_SETTINGS);
        } else {
          console.error('Error fetching security settings:', error);
          toast({
            title: 'Error',
            description: 'Failed to load security settings',
            variant: 'destructive',
          });
        }
      } else if (data) {
        setSettings({
          two_factor_enabled: data.two_factor_enabled,
          login_alerts: data.login_alerts,
          session_timeout: data.session_timeout,
          device_tracking: data.device_tracking,
        });
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SecuritySettings>) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update settings',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setSaving(true);
      const updatedSettings = { ...settings, ...newSettings };

      // First, try to update
      const { error: updateError } = await supabase
        .from('user_security_settings')
        .update(updatedSettings)
        .eq('user_id', user.id);

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          // No row exists, insert instead
          const { error: insertError } = await supabase
            .from('user_security_settings')
            .insert({
              user_id: user.id,
              ...updatedSettings,
            });

          if (insertError) {
            throw insertError;
          }
        } else {
          throw updateError;
        }
      }

      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save security settings',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refreshSettings: fetchSettings,
  };
}
