import { DashboardLayout } from "@/components/DashboardLayout";
import { LikedClients } from "@/components/LikedClients";

const OwnerLikedClients = () => {
  return (
    <DashboardLayout userRole="owner">
      <LikedClients />
    </DashboardLayout>
  );
};

export default OwnerLikedClients;