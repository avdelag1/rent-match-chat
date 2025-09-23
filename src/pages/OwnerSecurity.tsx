import { AccountSecurity } from "@/components/AccountSecurity";
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const OwnerSecurity = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-400 to-red-500">
        <AppSidebar userRole="owner" />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white">Security</h1>
            <p className="text-white/80">Manage your account security</p>
          </div>
          
          <div className="flex-1 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
              <AccountSecurity userRole="owner" />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OwnerSecurity;