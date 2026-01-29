import { useSearchParams, useNavigate } from "react-router-dom";
import { UnifiedListingForm } from "@/components/UnifiedListingForm";
import { useEffect, useState } from "react";
import { CategorySelectionDialog } from "@/components/CategorySelectionDialog";

const OwnerNewListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setInitialData({ category: categoryParam, mode: 'rent' });
      setIsFormOpen(true);
    } else {
      setIsCategorySelectorOpen(true);
    }
  }, [searchParams]);

  const handleCategorySelect = (category: string) => {
    setIsCategorySelectorOpen(false);
    setSearchParams({ category: category });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    navigate('/owner/properties');
  };
  
  const handleCloseCategorySelector = () => {
      setIsCategorySelectorOpen(false);
      navigate('/owner/dashboard');
  }

  return (
    <>
      <CategorySelectionDialog
        isOpen={isCategorySelectorOpen}
        onClose={handleCloseCategorySelector}
        onSelectCategory={handleCategorySelect}
      />
      {initialData && (
        <UnifiedListingForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          editingProperty={initialData}
        />
      )}
    </>
  );
};

export default OwnerNewListing;