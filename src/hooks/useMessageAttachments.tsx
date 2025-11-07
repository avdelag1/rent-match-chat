import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Feature flag for attachments
const ATTACHMENTS_ENABLED = false;

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  attachment_type: 'image' | 'document' | 'video';
  created_at: string;
}

export const useMessageAttachments = (messageId: string) => {
  return useQuery({
    queryKey: ['message-attachments', messageId],
    queryFn: async () => {
      // Return empty array until database migration is complete
      return [] as MessageAttachment[];
    },
    enabled: false, // Disable until database is ready
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      file, 
      attachmentType 
    }: { 
      messageId: string; 
      file: File; 
      attachmentType: 'image' | 'document' | 'video';
    }) => {
      if (!ATTACHMENTS_ENABLED) {
        console.warn('File attachments feature is not yet available');
        return null;
      }
      // Future implementation will go here
      throw new Error('File attachments feature is pending database migration');
    },
    onSuccess: () => {
      if (!ATTACHMENTS_ENABLED) return;
      toast({
        title: 'File Uploaded',
        description: 'Your attachment has been uploaded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: 'File attachments feature is pending database migration.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      if (!ATTACHMENTS_ENABLED) {
        console.warn('File attachments feature is not yet available');
        return null;
      }
      // Future implementation will go here
      throw new Error('File attachments feature is pending database migration');
    },
    onSuccess: () => {
      if (!ATTACHMENTS_ENABLED) return;
      toast({
        title: 'File Deleted',
        description: 'The attachment has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: 'File attachments feature is pending database migration.',
        variant: 'destructive',
      });
    },
  });
};

export const getAttachmentUrl = async (filePath: string): Promise<string | null> => {
  if (!ATTACHMENTS_ENABLED) {
    console.warn('File attachments feature is not yet available');
    return null;
  }
  // Future implementation will go here
  throw new Error('File attachments feature is pending database migration');
};