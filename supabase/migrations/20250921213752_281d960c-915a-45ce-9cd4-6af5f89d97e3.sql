-- Create digital contracts and signature management tables

-- Enum for contract types
CREATE TYPE contract_type AS ENUM ('lease', 'rental', 'purchase', 'rental_agreement');

-- Enum for signature types
CREATE TYPE signature_type AS ENUM ('drawn', 'typed', 'uploaded');

-- Enum for deal status
CREATE TYPE deal_status AS ENUM ('pending', 'signed_by_owner', 'signed_by_client', 'completed', 'cancelled', 'disputed');

-- Digital contracts table
CREATE TABLE digital_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  contract_type contract_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  created_by UUID NOT NULL,
  listing_id UUID,
  client_id UUID,
  owner_id UUID NOT NULL,
  status deal_status DEFAULT 'pending',
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract signatures table
CREATE TABLE contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES digital_contracts(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL,
  signature_data TEXT NOT NULL, -- Base64 encoded signature image or text
  signature_type signature_type NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Deal status tracking
CREATE TABLE deal_status_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES digital_contracts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  listing_id UUID,
  status deal_status DEFAULT 'pending',
  signed_by_owner_at TIMESTAMP WITH TIME ZONE,
  signed_by_client_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispute reports table
CREATE TABLE dispute_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES digital_contracts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reported_against UUID NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', false);

-- Enable RLS on all tables
ALTER TABLE digital_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_status_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for digital_contracts
CREATE POLICY "Users can view contracts they are involved in" ON digital_contracts
FOR SELECT USING (
  auth.uid() = created_by OR 
  auth.uid() = client_id OR 
  auth.uid() = owner_id
);

CREATE POLICY "Owners can create contracts" ON digital_contracts
FOR INSERT WITH CHECK (auth.uid() = created_by AND auth.uid() = owner_id);

CREATE POLICY "Contract parties can update status" ON digital_contracts
FOR UPDATE USING (
  auth.uid() = client_id OR 
  auth.uid() = owner_id
);

-- RLS Policies for contract_signatures
CREATE POLICY "Users can view signatures on their contracts" ON contract_signatures
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM digital_contracts dc 
    WHERE dc.id = contract_signatures.contract_id 
    AND (auth.uid() = dc.client_id OR auth.uid() = dc.owner_id OR auth.uid() = dc.created_by)
  )
);

CREATE POLICY "Users can sign their own contracts" ON contract_signatures
FOR INSERT WITH CHECK (auth.uid() = signer_id);

-- RLS Policies for deal_status_tracking
CREATE POLICY "Users can view their deals" ON deal_status_tracking
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = owner_id);

CREATE POLICY "Users can update their deals" ON deal_status_tracking
FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create deals" ON deal_status_tracking
FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = owner_id);

-- RLS Policies for dispute_reports
CREATE POLICY "Users can view disputes they are involved in" ON dispute_reports
FOR SELECT USING (auth.uid() = reported_by OR auth.uid() = reported_against);

CREATE POLICY "Users can create dispute reports" ON dispute_reports
FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Storage policies for contracts
CREATE POLICY "Contract parties can view contract files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'contracts' AND 
  EXISTS (
    SELECT 1 FROM digital_contracts dc 
    WHERE dc.file_path = storage.objects.name 
    AND (auth.uid() = dc.client_id OR auth.uid() = dc.owner_id OR auth.uid() = dc.created_by)
  )
);

CREATE POLICY "Owners can upload contract files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'contracts');

-- Storage policies for signatures
CREATE POLICY "Users can view signatures on their contracts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'signatures' AND 
  EXISTS (
    SELECT 1 FROM contract_signatures cs
    JOIN digital_contracts dc ON cs.contract_id = dc.id
    WHERE cs.signature_data LIKE '%' || storage.objects.name || '%'
    AND (auth.uid() = dc.client_id OR auth.uid() = dc.owner_id OR auth.uid() = cs.signer_id)
  )
);

CREATE POLICY "Users can upload their signatures" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'signatures');

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_digital_contracts_updated_at
  BEFORE UPDATE ON digital_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_status_tracking_updated_at
  BEFORE UPDATE ON deal_status_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispute_reports_updated_at
  BEFORE UPDATE ON dispute_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();