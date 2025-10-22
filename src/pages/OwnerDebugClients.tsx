import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function OwnerDebugClients() {
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const runDebug = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Check user roles
      const { data: clientRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'client');
      
      results.clientRoles = {
        count: clientRoles?.length || 0,
        data: clientRoles,
        error: rolesError?.message
      };

      // Check profiles
      if (clientRoles && clientRoles.length > 0) {
        const clientIds = clientRoles.map(r => r.user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, age, is_active, images')
          .in('id', clientIds);
        
        results.profiles = {
          count: profiles?.length || 0,
          activeCount: profiles?.filter(p => p.is_active).length || 0,
          withImages: profiles?.filter(p => p.images && p.images.length > 0).length || 0,
          data: profiles,
          error: profilesError?.message
        };
      }

      // Check owner preferences
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: prefs, error: prefsError } = await supabase
          .from('owner_client_preferences')
          .select('*')
          .eq('user_id', user.user.id)
          .maybeSingle();
        
        results.ownerPreferences = {
          exists: !!prefs,
          data: prefs,
          error: prefsError?.message
        };
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebug(results);
    setLoading(false);
  };

  useEffect(() => {
    runDebug();
  }, []);

  return (
    <DashboardLayout userRole="owner">
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>🔍 Client Debug Panel</CardTitle>
              <Button onClick={runDebug} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Client Roles */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-bold mb-2">📋 Client User Roles</h3>
              <p className="text-sm">
                Found: <span className="font-mono font-bold">{debug.clientRoles?.count || 0}</span> users with role="client"
              </p>
              {debug.clientRoles?.error && (
                <p className="text-sm text-destructive mt-2">Error: {debug.clientRoles.error}</p>
              )}
              {debug.clientRoles?.data && debug.clientRoles.data.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">View client IDs</summary>
                  <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto max-h-40">
                    {JSON.stringify(debug.clientRoles.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* Profiles */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-bold mb-2">👤 Client Profiles</h3>
              <div className="space-y-1 text-sm">
                <p>Total profiles: <span className="font-mono font-bold">{debug.profiles?.count || 0}</span></p>
                <p>Active profiles: <span className="font-mono font-bold">{debug.profiles?.activeCount || 0}</span></p>
                <p>With images: <span className="font-mono font-bold">{debug.profiles?.withImages || 0}</span></p>
              </div>
              {debug.profiles?.error && (
                <p className="text-sm text-destructive mt-2">Error: {debug.profiles.error}</p>
              )}
              {debug.profiles?.data && debug.profiles.data.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">View profiles</summary>
                  <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto max-h-40">
                    {JSON.stringify(debug.profiles.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* Owner Preferences */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-bold mb-2">⚙️ Your Client Filters</h3>
              <p className="text-sm">
                Filters set: <span className="font-mono font-bold">{debug.ownerPreferences?.exists ? 'YES' : 'NO'}</span>
              </p>
              {debug.ownerPreferences?.error && (
                <p className="text-sm text-destructive mt-2">Error: {debug.ownerPreferences.error}</p>
              )}
              {debug.ownerPreferences?.data && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">View your filters</summary>
                  <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto max-h-40">
                    {JSON.stringify(debug.ownerPreferences.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="font-bold mb-2">📊 Summary</h3>
              {debug.clientRoles?.count === 0 && (
                <p className="text-sm text-destructive">
                  ❌ No clients found in database. You need users with role="client" in the user_roles table.
                </p>
              )}
              {debug.clientRoles?.count > 0 && debug.profiles?.activeCount === 0 && (
                <p className="text-sm text-destructive">
                  ❌ Clients exist but no active profiles. Check profiles table for is_active=true.
                </p>
              )}
              {debug.profiles?.activeCount > 0 && (
                <p className="text-sm text-green-600">
                  ✅ {debug.profiles.activeCount} active client profile(s) available!
                </p>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
