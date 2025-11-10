import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Anchor, Bike, CircleDot } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorySelect?: (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => void;
  navigateToNewPage?: boolean;
}

export function CategorySelectionDialog({ 
  open, 
  onOpenChange, 
  onCategorySelect,
  navigateToNewPage = false
}: CategorySelectionDialogProps) {
  const navigate = useNavigate();

  const handleSelect = (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => {
    if (navigateToNewPage) {
      // Navigate to the new listing page with category and mode as query params
      navigate(`/owner/listings/new?category=${category}&mode=${mode}`);
      onOpenChange(false);
    } else {
      // Use callback for inline form (backward compatibility)
      if (onCategorySelect) {
        onCategorySelect(category, mode);
      } else {
        console.warn('CategorySelectionDialog: onCategorySelect callback is required when navigateToNewPage is false');
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-2xl">Add New Listing</DialogTitle>
          <DialogDescription>
            Choose the category and type of listing you want to create.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Home className="w-6 h-6 text-primary" />
                  <CardTitle>Property</CardTitle>
                </div>
                <CardDescription>Apartments, houses, condos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => handleSelect('property', 'rent')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Rent
                </Button>
                <Button 
                  onClick={() => handleSelect('property', 'sale')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Sale
                </Button>
                <Button 
                  onClick={() => handleSelect('property', 'both')} 
                  variant="outline" 
                  className="w-full"
                >
                  Both
                </Button>
              </CardContent>
            </Card>

            {/* Yacht Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Anchor className="w-6 h-6 text-primary" />
                  <CardTitle>Yacht</CardTitle>
                </div>
                <CardDescription>Boats, yachts, sailing vessels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => handleSelect('yacht', 'rent')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Rent
                </Button>
                <Button 
                  onClick={() => handleSelect('yacht', 'sale')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Sale
                </Button>
                <Button 
                  onClick={() => handleSelect('yacht', 'both')} 
                  variant="outline" 
                  className="w-full"
                >
                  Both
                </Button>
              </CardContent>
            </Card>

            {/* Motorcycle Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CircleDot className="w-6 h-6 text-primary" />
                  <CardTitle>Motorcycle</CardTitle>
                </div>
                <CardDescription>Motorcycles, scooters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => handleSelect('motorcycle', 'rent')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Rent
                </Button>
                <Button 
                  onClick={() => handleSelect('motorcycle', 'sale')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Sale
                </Button>
                <Button 
                  onClick={() => handleSelect('motorcycle', 'both')} 
                  variant="outline" 
                  className="w-full"
                >
                  Both
                </Button>
              </CardContent>
            </Card>

            {/* Bicycle Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bike className="w-6 h-6 text-primary" />
                  <CardTitle>Bicycle</CardTitle>
                </div>
                <CardDescription>Bikes, e-bikes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => handleSelect('bicycle', 'rent')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Rent
                </Button>
                <Button 
                  onClick={() => handleSelect('bicycle', 'sale')} 
                  variant="outline" 
                  className="w-full"
                >
                  For Sale
                </Button>
                <Button 
                  onClick={() => handleSelect('bicycle', 'both')} 
                  variant="outline" 
                  className="w-full"
                >
                  Both
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
