import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LegalDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  created_at: string;
  listing_id?: string;
}

export function useListingLegalDocuments(listingId?: string) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['listing-legal-documents', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      
      const { data, error } = await supabase
        .from('legal_documents' as any)
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return ((data || []) as unknown) as LegalDocument[];
    },
    enabled: !!listingId
  });
  
  const hasVerifiedDocuments = documents.some(d => d.status === 'verified');
  const hasPendingDocuments = documents.some(d => d.status === 'pending');
  
  return { 
    documents, 
    hasVerifiedDocuments, 
    hasPendingDocuments,
    isLoading 
  };
}
