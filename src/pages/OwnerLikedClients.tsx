import { LikedClients } from "@/components/LikedClients";
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const OwnerLikedClients = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-400 to-red-500">
        <AppSidebar userRole="owner" />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white">Liked Clients</h1>
            <p className="text-white/80">Clients you've shown interest in</p>
          </div>
          
          <div className="flex-1 p-4">
            <LikedClients />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OwnerLikedClients;