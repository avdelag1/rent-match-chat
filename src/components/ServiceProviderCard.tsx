import { motion } from 'framer-motion';
import { ServiceWithProfile, SERVICE_TYPES } from '@/hooks/useClientService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Clock, MessageCircle, CheckCircle, Star } from 'lucide-react';

interface ServiceProviderCardProps {
  service: ServiceWithProfile;
  onContact?: (userId: string) => void;
}

export function ServiceProviderCard({ service, onContact }: ServiceProviderCardProps) {
  const serviceInfo = SERVICE_TYPES.find(s => s.value === service.service_type);
  const displayName = service.service_type === 'other' 
    ? service.custom_service_name 
    : serviceInfo?.label;

  const profile = service.profiles as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-xl transition-shadow">
        {/* Service Photos */}
        {service.service_photos && service.service_photos.length > 0 && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={service.service_photos[0]}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Service Type Badge */}
            <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm border-white/20">
              <span className="mr-1">{serviceInfo?.icon || '✨'}</span>
              {displayName}
            </Badge>

            {/* Photo count */}
            {service.service_photos.length > 1 && (
              <Badge variant="secondary" className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm">
                +{service.service_photos.length - 1} photos
              </Badge>
            )}
          </div>
        )}

        <CardContent className="p-4">
          {/* Provider Info */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {profile?.full_name || 'Service Provider'}
              </h3>
              {profile?.city && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  {profile.city}
                </div>
              )}
            </div>
          </div>

          {/* Service Title */}
          <h4 className="font-medium text-foreground mb-3 line-clamp-2">
            {service.title}
          </h4>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 mb-4">
            {service.hourly_rate && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <DollarSign className="w-3 h-3 mr-1" />
                ${service.hourly_rate}/hr
              </Badge>
            )}
            {service.experience_years && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Clock className="w-3 h-3 mr-1" />
                {service.experience_years} years exp.
              </Badge>
            )}
          </div>

          {/* Availability */}
          {service.availability && (
            <p className="text-xs text-muted-foreground mb-3">
              📅 {service.availability}
            </p>
          )}

          {/* Contact Button */}
          <Button
            onClick={() => onContact?.(service.user_id)}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
