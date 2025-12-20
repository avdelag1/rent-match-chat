import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User, MapPin, Briefcase, Calendar, Lock, LogIn, UserPlus,
  Sparkles, Star, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicProfilePreview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch public profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('No profile ID provided');

      // Try to fetch from profiles_public first (read-only public view)
      const { data: publicProfile, error: publicError } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('id', id)
        .single();

      if (publicError && publicError.code !== 'PGRST116') {
        // If profiles_public doesn't exist, fall back to profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, age, city, images, bio, interests, verified, occupation')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        return profile;
      }

      return publicProfile;
    },
    enabled: !!id,
  });

  // If user is authenticated, redirect to full profile view
  const handleViewFullProfile = () => {
    if (user) {
      // Check if user is owner (can view clients)
      navigate(`/owner/view-client/${id}`);
    } else {
      // Redirect to signup with return URL
      navigate(`/?returnTo=/profile/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-4">
              <User className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-gray-400 mb-6">
              This profile may have been removed or is no longer available.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = profile.images || [];
  const hasImages = images.length > 0;
  const previewImage = hasImages ? images[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-white">SwipeMatch</span>
          </div>
          {!user && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Preview Card */}
          <Card className="overflow-hidden bg-gray-800/50 border-gray-700/50">
            {/* Profile Image */}
            <div className="relative aspect-[3/4] max-h-[400px] overflow-hidden">
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt={profile.full_name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <User className="w-24 h-24 text-gray-500" />
                </div>
              )}

              {/* Profile Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end gap-4">
                  <Avatar className="w-20 h-20 border-4 border-gray-900 shadow-xl">
                    <AvatarImage src={previewImage || undefined} />
                    <AvatarFallback className="bg-primary text-2xl font-bold">
                      {profile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-white truncate">
                        {profile.full_name || 'Anonymous'}
                      </h1>
                      {profile.age && (
                        <span className="text-xl text-gray-300">{profile.age}</span>
                      )}
                      {profile.verified && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                      {profile.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {profile.city}
                        </span>
                      )}
                      {profile.occupation && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {profile.occupation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Bio Preview */}
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">About</h3>
                  <p className="text-white line-clamp-3">{profile.bio}</p>
                </div>
              )}

              {/* Interests Preview */}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.slice(0, 5).map((interest: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {interest}
                      </Badge>
                    ))}
                    {profile.interests.length > 5 && (
                      <Badge variant="secondary" className="bg-gray-700 text-gray-400">
                        +{profile.interests.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blurred Content Teaser */}
          <Card className="relative overflow-hidden bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-6">
              {/* Blurred preview content */}
              <div className="filter blur-sm pointer-events-none select-none space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-600" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-600 rounded" />
                    <div className="h-3 w-1/2 bg-gray-600 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-600 rounded" />
                  <div className="h-3 w-5/6 bg-gray-600 rounded" />
                  <div className="h-3 w-4/5 bg-gray-600 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-600 rounded-full" />
                  <div className="h-6 w-20 bg-gray-600 rounded-full" />
                  <div className="h-6 w-14 bg-gray-600 rounded-full" />
                </div>
              </div>

              {/* Overlay with CTA */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/60 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="p-3 rounded-full bg-primary/20 w-fit mx-auto mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    See Full Profile
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 max-w-xs">
                    Create an account to view complete profile details, lifestyle preferences, and connect with this user.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Ready to Connect?
              </h3>
              <p className="text-gray-300 text-sm max-w-md mx-auto">
                Join SwipeMatch to view full profiles, match with compatible users, and start meaningful conversations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold"
                  onClick={() => navigate('/')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Free Account
                </Button>
                {user && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                    onClick={handleViewFullProfile}
                  >
                    View Full Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4">
            <p>SwipeMatch - Find Your Perfect Match</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
