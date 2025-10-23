import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle, MapPin, Briefcase, Heart } from 'lucide-react';
import { ImageCarousel } from '@/components/ImageCarousel';
import { toast } from 'sonner';

export default function OwnerViewClientProfile() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client-profile', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleConnect = () => {
    navigate(`/messages?startConversation=${clientId}`);
    toast.success('Starting conversation...');
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="owner">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout userRole="owner">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Client not found</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const images = client.images || [];

  return (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Images */}
          {images.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-0">
                <ImageCarousel images={images} alt={`${client.full_name}'s profile`} />
              </CardContent>
            </Card>
          )}

          {/* Profile Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={client.avatar_url || images[0]} />
                  <AvatarFallback>{client.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold">{client.full_name}</h1>
                    {client.verified && (
                      <Badge variant="default">Verified</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-muted-foreground">
                    {client.age && <span>{client.age} years old</span>}
                    {client.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {client.location}
                      </span>
                    )}
                    {client.occupation && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {client.occupation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {client.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{client.bio}</p>
                </div>
              )}

              {/* Budget */}
              {(client.budget_min || client.budget_max) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Budget Range</h3>
                  <p className="text-muted-foreground">
                    ${client.budget_min?.toLocaleString() || '0'} - ${client.budget_max?.toLocaleString() || 'Unlimited'}
                  </p>
                </div>
              )}

              {/* Interests */}
              {client.interests && client.interests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Tags */}
              {client.lifestyle_tags && client.lifestyle_tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Lifestyle</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.lifestyle_tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Activities */}
              {client.preferred_activities && client.preferred_activities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Preferred Activities</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.preferred_activities.map((activity, idx) => (
                      <Badge key={idx} variant="outline">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-6">
            <Button onClick={handleConnect} className="flex-1" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Conversation
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
