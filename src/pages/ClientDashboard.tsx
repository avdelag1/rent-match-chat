import { DashboardLayout } from '@/components/DashboardLayout';
import { SimpleSwipeContainer } from '@/components/SimpleSwipeContainer';
import { PageTransition } from '@/components/PageTransition';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  return (
    <DashboardLayout userRole="client">
      <PageTransition>
        <div className="w-full min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Find Your Perfect Place
              </h1>
              <p className="text-gray-600">Swipe right to save, left to pass</p>
            </div>

            <SimpleSwipeContainer />
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default ClientDashboard;
