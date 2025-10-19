import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { Users, Shield, Check, X, Star, AlertTriangle } from 'lucide-react';

export function TenantScreening() {
  const { data: clientProfiles = [] } = useClientProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getVerificationStatus = (profile: any) => {
    // Mock verification logic
    const score = Math.random();
    if (score > 0.8) return 'verified';
    if (score > 0.5) return 'pending';
    return 'failed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredProfiles = clientProfiles.filter(profile => {
    const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getVerificationStatus(profile);
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenant Screening</h1>
          <p className="text-muted-foreground">Review and verify potential tenants</p>
        </div>
        <Button className="gap-2">
          <Shield className="w-4 h-4" />
          Screening Settings
        </Button>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Applicants</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="filter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredProfiles.map((profile) => {
              const status = getVerificationStatus(profile);
              const score = Math.floor(Math.random() * 100) + 1;
              
              return (
                <Card key={profile.user_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(status)}`} />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">{profile.name || 'Anonymous User'}</h3>
                          <p className="text-muted-foreground">Age: {profile.age || 'N/A'} • {profile.location?.city || 'Location not specified'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">Credit Score: {score}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={status === 'verified' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>
                            {status === 'verified' && <Check className="w-3 h-3 mr-1" />}
                            {status === 'pending' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {status === 'failed' && <X className="w-3 h-3 mr-1" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            Applied 2 days ago
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {status === 'pending' && (
                            <>
                              <Button size="sm" variant="default">
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive">
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProfiles.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No applications match your search criteria.' : 'No tenant applications yet.'}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verified">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Verified tenants will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Screening reports will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}