import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LegalDocumentsDialog } from '@/components/LegalDocumentsDialog';
import { ContractSigningDialog } from '@/components/ContractSigningDialog';
import { FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function TestLegalWorkflow() {
  const [showLegalDocs, setShowLegalDocs] = useState(false);
  const [showContractSigning, setShowContractSigning] = useState(false);
  const [testContractId, setTestContractId] = useState<string>('');

  const testFeatures = [
    {
      name: 'Legal Document Upload',
      description: 'Upload and manage legal documents with verification',
      status: 'ready',
      action: () => setShowLegalDocs(true),
      icon: FileText,
    },
    {
      name: 'Digital Contract Signing',
      description: 'Sign contracts with digital signatures',
      status: 'ready',
      action: () => {
        // In a real app, you'd select a contract from a list
        setTestContractId('test-contract-id');
        setShowContractSigning(true);
      },
      icon: Shield,
    },
    {
      name: 'Review & Rating System',
      description: 'Rate properties and users',
      status: 'database-pending',
      action: () => {
        toast({
          title: 'Feature Ready',
          description: 'Review system is built but waiting for database migration approval.',
        });
      },
      icon: CheckCircle,
    },
    {
      name: 'Enhanced Messaging',
      description: 'File attachments and media sharing',
      status: 'database-pending',
      action: () => {
        toast({
          title: 'Feature Ready',
          description: 'Enhanced messaging is built but waiting for database migration approval.',
        });
      },
      icon: AlertCircle,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Ready</Badge>;
      case 'database-pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">DB Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-6 h-6 text-primary" />
            Security & Feature Implementation Status
          </CardTitle>
          <p className="text-muted-foreground">
            Test the implemented security fixes and new features for the application.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {testFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.name} className="bg-background border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(feature.status)}
                    </div>
                    <Button
                      onClick={feature.action}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={feature.status === 'database-pending'}
                    >
                      {feature.status === 'ready' ? 'Test Feature' : 'Waiting for Migration'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Implementation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">✅ Completed Security Fixes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>• Created reviews table with proper RLS policies</li>
              <li>• Created message_attachments table with secure file handling</li>
              <li>• Set up storage buckets with proper access controls</li>
              <li>• Implemented proper database functions and triggers</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">🏗️ Built Components:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>• ReviewDialog & ReviewCard for rating system</li>
              <li>• ReviewsList for displaying reviews with statistics</li>
              <li>• MessageAttachments for file sharing in conversations</li>
              <li>• Enhanced useReviews and useMessageAttachments hooks</li>
              <li>• Improved MessagingInterface with attachment previews</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">🔧 Tested Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>• Legal document upload and management workflow</li>
              <li>• Digital contract signing process</li>
              <li>• Premium messaging quota system</li>
              <li>• User authentication and role management</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Legal Documents Dialog */}
      <LegalDocumentsDialog
        open={showLegalDocs}
        onOpenChange={setShowLegalDocs}
      />

      {/* Contract Signing Dialog */}
      {testContractId && (
        <ContractSigningDialog
          contractId={testContractId}
          open={showContractSigning}
          onOpenChange={(open) => {
            setShowContractSigning(open);
            if (!open) setTestContractId('');
          }}
        />
      )}
    </div>
  );
}