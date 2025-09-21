
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { MessagingTest } from "@/components/MessagingTest";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
      <LegendaryLandingPage />
      {user && (
        <div className="container mx-auto p-6">
          <MessagingTest />
        </div>
      )}
    </div>
  );
};

export default Index;
