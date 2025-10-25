-- Drop trigger and function, then recreate with proper search_path
DROP TRIGGER IF EXISTS trigger_update_listing_verification ON legal_documents;
DROP FUNCTION IF EXISTS update_listing_verification();

-- Create function with proper search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER trigger_update_listing_verification
AFTER INSERT OR UPDATE OF status ON legal_documents
FOR EACH ROW
EXECUTE FUNCTION update_listing_verification();