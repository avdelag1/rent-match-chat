import { MessageActivationPackages } from "@/components/MessageActivationPackages";

type PackageCategory = 'client_monthly' | 'owner_monthly' | 'client_pay_per_use' | 'owner_pay_per_use';

interface SubscriptionPackage {
  id: number;
  name: string;
  tier: string;
  package_category: PackageCategory;
  price: number;
  message_activations: number;
  legal_documents_included: number;
  max_listings?: number;
  duration_days?: number;
  features: string[];
  paypal_link?: string;
}

export default function SubscriptionPackagesPage() {
  return (
    <div className="container mx-auto py-8">
      <MessageActivationPackages showAsPage />
    </div>
  );
}
