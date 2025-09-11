import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar, DollarSign, User, Download, Plus, Clock, AlertCircle } from 'lucide-react';

interface Lease {
  id: string;
  propertyTitle: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: 'active' | 'pending' | 'expired' | 'terminated';
  nextPayment: string;
}

export function LeaseManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock lease data
  const leases: Lease[] = [
    {
      id: '1',
      propertyTitle: 'Modern Downtown Apartment',
      tenantName: 'John Smith',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyRent: 2500,
      status: 'active',
      nextPayment: '2024-10-01'
    },
    {
      id: '2',
      propertyTitle: 'Cozy Suburban House',
      tenantName: 'Sarah Johnson',
      startDate: '2024-03-15',
      endDate: '2025-03-14',
      monthlyRent: 1800,
      status: 'active',
      nextPayment: '2024-10-15'
    },
    {
      id: '3',
      propertyTitle: 'Studio Loft',
      tenantName: 'Mike Davis',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      monthlyRent: 1200,
      status: 'expired',
      nextPayment: '-'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'terminated': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'expired': return 'destructive';
      case 'terminated': return 'outline';
      default: return 'outline';
    }
  };

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = 
      lease.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lease.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const isPaymentDue = (nextPayment: string) => {
    if (nextPayment === '-') return false;
    const paymentDate = new Date(nextPayment);
    const today = new Date();
    const daysUntil = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 5;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lease Management</h1>
          <p className="text-muted-foreground">Manage rental agreements and contracts</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Lease
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Leases</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Leases</Label>
              <Input
                id="search"
                placeholder="Search by property or tenant name..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredLeases.map((lease) => (
              <Card key={lease.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(lease.status)}`} />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{lease.propertyTitle}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {lease.tenantName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {lease.startDate} - {lease.endDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${lease.monthlyRent}/month
                          </div>
                        </div>
                        {lease.nextPayment !== '-' && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-4 h-4" />
                              Next payment: {lease.nextPayment}
                            </div>
                            {isPaymentDue(lease.nextPayment) && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Due Soon
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusVariant(lease.status)}>
                        {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                      </Badge>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {lease.status === 'active' && (
                          <Button size="sm" variant="secondary">
                            Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLeases.length === 0 && (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Leases Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No leases match your search criteria.' : 'No active leases yet.'}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Lease
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Pending leases will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Expired leases will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Lease templates will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}