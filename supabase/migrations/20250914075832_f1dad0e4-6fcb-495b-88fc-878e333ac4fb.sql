-- Create storage bucket for legal documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('legal-documents', 'legal-documents', false);

-- Create legal documents table to track uploads
CREATE TABLE public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'ownership_deed', 'tax_certificate', 'utility_bill', 'id_document', 'other'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for legal documents
CREATE POLICY "Users can upload their own legal documents" 
ON public.legal_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own legal documents" 
ON public.legal_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal documents" 
ON public.legal_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal documents" 
ON public.legal_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Storage policies for legal documents bucket
CREATE POLICY "Users can upload their own legal documents to storage" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own legal documents in storage" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own legal documents in storage" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own legal documents in storage" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updated_at
CREATE TRIGGER update_legal_documents_updated_at
    BEFORE UPDATE ON public.legal_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();