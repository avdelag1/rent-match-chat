-- Add listing relationship to legal_documents
ALTER TABLE legal_documents 
ADD COLUMN listing_id uuid REFERENCES listings(id) ON DELETE CASCADE;

-- Create indexes for faster queries
CREATE INDEX idx_legal_documents_listing_id ON legal_documents(listing_id);
CREATE INDEX idx_legal_documents_user_listing ON legal_documents(user_id, listing_id);

-- Add verification flag to listings
ALTER TABLE listings 
ADD COLUMN has_verified_documents boolean DEFAULT false;

-- Create function to update listing verification status
CREATE OR REPLACE FUNCTION update_listing_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the listing's has_verified_documents flag
  IF NEW.status = 'verified' AND NEW.listing_id IS NOT NULL THEN
    UPDATE listings 
    SET has_verified_documents = true 
    WHERE id = NEW.listing_id;
  ELSIF NEW.status != 'verified' AND NEW.listing_id IS NOT NULL THEN
    -- Check if there are any other verified documents for this listing
    UPDATE listings 
    SET has_verified_documents = EXISTS (
      SELECT 1 FROM legal_documents 
      WHERE listing_id = NEW.listing_id 
      AND status = 'verified'
      AND id != NEW.id
    )
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update listing verification
CREATE TRIGGER trigger_update_listing_verification
AFTER INSERT OR UPDATE OF status ON legal_documents
FOR EACH ROW
EXECUTE FUNCTION update_listing_verification();

-- Update existing listings based on verified legal documents
UPDATE listings l
SET has_verified_documents = EXISTS (
  SELECT 1 FROM legal_documents ld
  WHERE ld.user_id = l.owner_id
  AND ld.status = 'verified'
);