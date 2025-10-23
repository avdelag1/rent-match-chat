import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PropertyClientFilters } from '@/components/filters/PropertyClientFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';

export default function OwnerPropertyClientDiscovery() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { data: clients = [], refetch } = useSmartClientMatching('property');

  const filteredClients = (clients || []).filter(client =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof typeof filters];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    refetch();
  };

  const handleConnect = (clientId: string) => {
    navigate(`/messages?startConversation=${clientId}`);
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Property Clients</h1>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredClients?.length || 0} of {clients?.length || 0} clients
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/owner/properties')}>
                My Listings
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Filter Status */}
        {activeFilterCount > 0 && (
          <div className="border-b bg-muted/30">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  🎯 {activeFilterCount} Active Filter{activeFilterCount !== 1 ? 's' : ''}
                </p>
                <Button variant="ghost" size="sm" onClick={() => handleApplyFilters({})}>
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-6">
                <PropertyClientFilters
                  onApply={handleApplyFilters}
                  initialFilters={filters}
                  activeCount={activeFilterCount}
                />
              </div>
            </div>

            {/* Client Cards Grid */}
            <div className="flex-1">
              {filteredClients.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Try adjusting your filters or search query
                    </p>
                    {activeFilterCount > 0 && (
                      <Button variant="outline" onClick={() => handleApplyFilters({})}>
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={client.avatar_url} />
                            <AvatarFallback>{client.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{client.name}</h3>
                              {client.verified && (
                                <Badge variant="default" className="text-xs">Verified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {client.age} years • {client.city || 'Location not set'}
                            </p>
                          </div>
                        </div>

                        {/* Match Percentage */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Match Score</span>
                            <Badge 
                              variant={client.matchPercentage >= 80 ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {client.matchPercentage}% Match
                            </Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${client.matchPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Match Reasons */}
                        {client.matchReasons && client.matchReasons.length > 0 && (
                          <div className="mb-3 space-y-1">
                            {client.matchReasons.slice(0, 3).map((reason, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground">
                                ✓ {reason}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleConnect(client.user_id)}
                            className="flex-1"
                            size="sm"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/owner/view-client/${client.user_id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg">
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filter Property Clients</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-6">
                <PropertyClientFilters
                  onApply={handleApplyFilters}
                  initialFilters={filters}
                  activeCount={activeFilterCount}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </DashboardLayout>
  );
}
