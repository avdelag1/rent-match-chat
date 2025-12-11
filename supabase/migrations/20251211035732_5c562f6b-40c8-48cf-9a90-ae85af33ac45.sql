-- Create client_services table for service offerings
CREATE TABLE public.client_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  custom_service_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  hourly_rate NUMERIC(10,2),
  experience_years INTEGER,
  availability TEXT,
  service_photos TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

-- Create policies for client_services
CREATE POLICY "Users can view all active services"
ON public.client_services
FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can manage their own service"
ON public.client_services
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_client_services_service_type ON public.client_services(service_type);
CREATE INDEX idx_client_services_user_id ON public.client_services(user_id);
CREATE INDEX idx_client_services_active ON public.client_services(is_active);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_services_updated_at
BEFORE UPDATE ON public.client_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();