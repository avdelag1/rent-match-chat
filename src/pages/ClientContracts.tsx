import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useContracts, useActiveDeals } from "@/hooks/useContracts";
import { FileText, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ContractSigningDialog } from "@/components/ContractSigningDialog";

const ClientContracts = () => {
  const { data: contracts, isLoading: contractsLoading } = useContracts();
  const { data: activeDeals, isLoading: dealsLoading } = useActiveDeals();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'signed_by_owner': return 'bg-blue-100 text-blue-800';
      case 'signed_by_client': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (contractsLoading || dealsLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">My Contracts</h1>
            <p className="text-white/80">Manage your rental agreements and contracts</p>
          </div>

          {/* Active Deals Section */}
          {activeDeals && activeDeals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Active Deals</h2>
              <div className="grid gap-4">
                {activeDeals.map((deal) => (
                  <Card key={deal.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{deal.contract?.title}</h3>
                            <p className="text-white/70 text-sm">
                              {deal.contract?.contract_type.replace('_', ' ').toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(deal.status)}>
                            {getStatusIcon(deal.status)}
                            <span className="ml-1">{deal.status.replace('_', ' ')}</span>
                          </Badge>
                          {deal.status === 'signed_by_owner' && (
                            <Button 
                              onClick={() => setSelectedContract(deal.contract_id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Sign Contract
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Contracts Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">All Contracts</h2>
            
            {!contracts || contracts.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Contracts Yet</h3>
                  <p className="text-white/70">
                    When property owners send you contracts, they will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contracts.map((contract) => (
                  <Card key={contract.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{contract.title}</h3>
                            <p className="text-white/70 text-sm">
                              {contract.contract_type.replace('_', ' ').toUpperCase()} • 
                              Created {formatDistanceToNow(new Date(contract.created_at))} ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(contract.status)}>
                            {getStatusIcon(contract.status)}
                            <span className="ml-1">{contract.status.replace('_', ' ')}</span>
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {contract.status === 'signed_by_owner' && (
                            <Button 
                              onClick={() => setSelectedContract(contract.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Sign
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedContract && (
        <ContractSigningDialog
          contractId={selectedContract}
          open={!!selectedContract}
          onOpenChange={() => setSelectedContract(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ClientContracts;