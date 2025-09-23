import { MatchHistory } from "@/components/MatchHistory";
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const OwnerMatchHistory = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-400 to-red-500">
        <AppSidebar userRole="owner" />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white">Match History</h1>
            <p className="text-white/80">View your successful matches</p>
          </div>
          
          <div className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              <MatchHistory userRole="owner" />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OwnerMatchHistory;