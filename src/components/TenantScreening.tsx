import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { Users, Shield, Check, X, Star, AlertTriangle, Settings, Eye, FileText, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function TenantScreening() {
  const { data: clientProfiles = [] } = useClientProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showApplicantDialog, setShowApplicantDialog] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  // Screening settings state
  const [screeningSettings, setScreeningSettings] = useState({
    autoScreening: true,
    creditCheckRequired: true,
    backgroundCheckRequired: true,
    incomeVerification: true,
    employmentVerification: true,
    referenceCheck: false,
    minCreditScore: 650,
    minIncomeRatio: 3,
  });

  const handleSaveSettings = () => {
    toast.success("Screening settings saved successfully");
    setShowSettingsDialog(false);
  };

  const handleViewApplicant = (profile: any) => {
    setSelectedApplicant(profile);
    setShowApplicantDialog(true);
  };

  const handleApprove = (profile: any) => {
    toast.success(`${profile.name || 'Applicant'} has been approved`);
    setShowApplicantDialog(false);
  };

  const handleReject = (profile: any) => {
    toast.error(`${profile.name || 'Applicant'} has been rejected`);
    setShowApplicantDialog(false);
  };

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
        <Button className="gap-2" onClick={() => setShowSettingsDialog(true)}>
          <Settings className="w-4 h-4" />
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
                          <Button variant="outline" size="sm" onClick={() => handleViewApplicant(profile)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {status === 'pending' && (
                            <>
                              <Button size="sm" variant="default" onClick={() => handleApprove(profile)}>
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(profile)}>
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
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Screening reports will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Screening Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Screening Settings
            </DialogTitle>
            <DialogDescription>
              Configure your tenant screening requirements and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Auto Screening */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Auto Screening</Label>
                <p className="text-sm text-muted-foreground">Automatically screen new applicants</p>
              </div>
              <Switch
                checked={screeningSettings.autoScreening}
                onCheckedChange={(checked) => setScreeningSettings(prev => ({ ...prev, autoScreening: checked }))}
              />
            </div>

            {/* Credit Check */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Credit Check Required
                </Label>
                <p className="text-sm text-muted-foreground">Require credit history verification</p>
              </div>
              <Switch
                checked={screeningSettings.creditCheckRequired}
                onCheckedChange={(checked) => setScreeningSettings(prev => ({ ...prev, creditCheckRequired: checked }))}
              />
            </div>

            {/* Background Check */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Background Check Required
                </Label>
                <p className="text-sm text-muted-foreground">Require criminal background check</p>
              </div>
              <Switch
                checked={screeningSettings.backgroundCheckRequired}
                onCheckedChange={(checked) => setScreeningSettings(prev => ({ ...prev, backgroundCheckRequired: checked }))}
              />
            </div>

            {/* Income Verification */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Income Verification</Label>
                <p className="text-sm text-muted-foreground">Verify income documentation</p>
              </div>
              <Switch
                checked={screeningSettings.incomeVerification}
                onCheckedChange={(checked) => setScreeningSettings(prev => ({ ...prev, incomeVerification: checked }))}
              />
            </div>

            {/* Employment Verification */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Employment Verification</Label>
                <p className="text-sm text-muted-foreground">Verify current employment status</p>
              </div>
              <Switch
                checked={screeningSettings.employmentVerification}
                onCheckedChange={(checked) => setScreeningSettings(prev => ({ ...prev, employmentVerification: checked }))}
              />
            </div>

            {/* Reference Check */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Reference Check</Label>
                <p className="text-sm text-muted-foreground">Contact previous landlords</p>
              </div>
              <Switch
                checked={screeningSettings.referenceCheck}
                onCheckedChange={(checked) => setScreeningSettings(prev => ({ ...prev, referenceCheck: checked }))}
              />
            </div>

            {/* Minimum Credit Score */}
            <div className="space-y-2">
              <Label className="font-medium">Minimum Credit Score</Label>
              <Select
                value={screeningSettings.minCreditScore.toString()}
                onValueChange={(value) => setScreeningSettings(prev => ({ ...prev, minCreditScore: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="550">550 (Fair)</SelectItem>
                  <SelectItem value="600">600 (Good)</SelectItem>
                  <SelectItem value="650">650 (Very Good)</SelectItem>
                  <SelectItem value="700">700 (Excellent)</SelectItem>
                  <SelectItem value="750">750 (Exceptional)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Income to Rent Ratio */}
            <div className="space-y-2">
              <Label className="font-medium">Minimum Income-to-Rent Ratio</Label>
              <Select
                value={screeningSettings.minIncomeRatio.toString()}
                onValueChange={(value) => setScreeningSettings(prev => ({ ...prev, minIncomeRatio: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x Monthly Rent</SelectItem>
                  <SelectItem value="3">3x Monthly Rent</SelectItem>
                  <SelectItem value="4">4x Monthly Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Applicant Details Dialog */}
      <Dialog open={showApplicantDialog} onOpenChange={setShowApplicantDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Applicant Details
            </DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedApplicant.name || 'Anonymous User'}</h3>
                  <p className="text-muted-foreground">Age: {selectedApplicant.age || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>{selectedApplicant.location?.city || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupation</span>
                  <span>{selectedApplicant.occupation || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Income</span>
                  <span>{selectedApplicant.monthly_income || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Score</span>
                  <span>{Math.floor(Math.random() * 300) + 500}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">{selectedApplicant.bio || 'No bio provided.'}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApplicantDialog(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={() => selectedApplicant && handleReject(selectedApplicant)}>
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button onClick={() => selectedApplicant && handleApprove(selectedApplicant)}>
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}