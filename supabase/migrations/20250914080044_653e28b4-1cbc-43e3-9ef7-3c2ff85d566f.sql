-- Create legal documents table (if not exists)
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'legal_documents' 
        AND policyname = 'Users can upload their own legal documents'
    ) THEN
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
    END IF;
END $$;