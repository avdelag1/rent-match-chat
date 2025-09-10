import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Search, Plus, Edit3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  createdAt: Date;
  resultCount?: number;
}

interface SavedSearchesProps {
  userRole: 'client' | 'owner';
}

export function SavedSearches({ userRole }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'Beach Apartments',
      filters: { priceRange: [1000, 3000], propertyTypes: ['apartment'], locationZones: ['Zona Hotelera'] },
      createdAt: new Date(),
      resultCount: 12
    },
    {
      id: '2', 
      name: 'Family Homes',
      filters: { bedrooms: [3, 5], amenities: ['parking', 'security'] },
      createdAt: new Date(),
      resultCount: 8
    }
  ]);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

  const handleSaveSearch = (filters: any, name?: string) => {
    const searchName = name || newSearchName || `Search ${savedSearches.length + 1}`;
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters,
      createdAt: new Date()
    };
    
    setSavedSearches(prev => [newSearch, ...prev]);
    setNewSearchName('');
    setShowCreateDialog(false);
    
    toast({
      title: 'Search Saved',
      description: `"${searchName}" has been saved to your searches.`
    });
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
    toast({
      title: 'Search Deleted',
      description: 'The saved search has been removed.'
    });
  };

  const handleRunSearch = (search: SavedSearch) => {
    toast({
      title: 'Running Search',
      description: `Applying filters from "${search.name}"`
    });
    // Here you would apply the saved filters to the current search
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Saved Searches</h3>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Save Current Search
        </Button>
      </div>

      {savedSearches.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <Search className="w-12 h-12 mx-auto text-white/50 mb-4" />
            <p className="text-white/70">No saved searches yet</p>
            <p className="text-white/50 text-sm">Save your filter combinations for quick access</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {savedSearches.map((search) => (
            <Card key={search.id} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{search.name}</h4>
                    <p className="text-white/60 text-sm">
                      Saved {search.createdAt.toLocaleDateString()}
                      {search.resultCount && ` • ${search.resultCount} results`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRunSearch(search)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingSearch(search)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSearch(search.id)}
                      className="text-white/70 hover:text-red-400 hover:bg-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {search.filters.propertyTypes?.map((type: string) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {search.filters.priceRange && (
                    <Badge variant="secondary" className="text-xs">
                      ${search.filters.priceRange[0]} - ${search.filters.priceRange[1]}
                    </Badge>
                  )}
                  {search.filters.locationZones?.map((zone: string) => (
                    <Badge key={zone} variant="secondary" className="text-xs">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-black/90 backdrop-blur border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Save Current Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white/90 text-sm font-medium">Search Name</label>
              <Input
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
                placeholder="Enter a name for this search"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSaveSearch({}, newSearchName)}>
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}