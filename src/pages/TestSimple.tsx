import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function TestSimple() {
  const [listings, setListings] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log('User:', data.user);
      setUser(data.user);
    });
  }, []);

  // Load listings
  useEffect(() => {
    console.log('Loading listings...');

    supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'active')
      .limit(10)
      .then(({ data, error }) => {
        console.log('Listings response:', { data, error });

        if (error) {
          console.error('Error loading listings:', error);
          toast({
            title: 'Error',
            description: `Failed to load listings: ${error.message}`,
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        if (data) {
          console.log(`Loaded ${data.length} listings`);
          setListings(data);
        }
        setLoading(false);
      });
  }, []);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in first',
        variant: 'destructive'
      });
      return;
    }

    const listing = listings[currentIndex];
    if (!listing) return;

    console.log('🔥 SAVING LIKE:', {
      user_id: user.id,
      target_id: listing.id,
      direction: 'right'
    });

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('likes')
        .upsert({
          user_id: user.id,
          target_id: listing.id,
          direction: 'right'
        })
        .select();

      if (error) {
        console.error('❌ ERROR SAVING:', error);
        toast({
          title: 'Error',
          description: `Save failed: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        console.log('✅ SAVED SUCCESSFULLY:', data);
        toast({
          title: '❤️ Liked!',
          description: 'Property saved successfully'
        });
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('❌ EXCEPTION:', err);
      toast({
        title: 'Error',
        description: err.message || 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-bold">Loading listings...</p>
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">No Listings Found</h2>
          <div className="bg-yellow-100 border border-yellow-400 rounded p-4 text-left text-sm">
            <p className="font-bold mb-2">Debug Info:</p>
            <p>Check console for errors (F12)</p>
            <p>Listings count: {listings.length}</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold">All done!</h2>
          <button
            onClick={() => setCurrentIndex(0)}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const listing = listings[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ULTRA SIMPLE TEST
          </h1>
          <p className="text-gray-600">
            {currentIndex + 1} of {listings.length}
          </p>
          {!user && (
            <div className="mt-4 bg-red-100 border border-red-400 rounded p-3 text-red-800">
              ⚠️ Not logged in - likes won't save
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Image */}
          <div className="h-96 bg-gray-200">
            {listing.images && listing.images[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🏠
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{listing.title}</h2>
                <p className="text-gray-600">{listing.city}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">
                  ${listing.price?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">/month</div>
              </div>
            </div>

            <div className="flex gap-4 text-gray-700">
              {listing.beds && <div>🛏️ {listing.beds} beds</div>}
              {listing.baths && <div>🚿 {listing.baths} baths</div>}
              {listing.square_footage && <div>📐 {listing.square_footage} ft²</div>}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={handlePass}
            disabled={saving}
            className="w-20 h-20 rounded-full bg-red-500 text-white text-4xl hover:bg-red-600 disabled:opacity-50 shadow-lg"
          >
            ✕
          </button>
          <button
            onClick={handleLike}
            disabled={saving}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-4xl hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 shadow-xl"
          >
            {saving ? '⏳' : '❤️'}
          </button>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs">
          <div className="font-bold mb-2">🐛 DEBUG INFO:</div>
          <div>User ID: {user?.id || 'NOT LOGGED IN'}</div>
          <div>Current Listing ID: {listing.id}</div>
          <div>Total Listings: {listings.length}</div>
          <div>Current Index: {currentIndex}</div>
          <div>Saving: {saving ? 'YES' : 'NO'}</div>
          <div className="mt-2 text-yellow-400">
            Open Console (F12) to see detailed logs
          </div>
        </div>
      </div>
    </div>
  );
}
