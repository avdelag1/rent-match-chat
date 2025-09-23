import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerStats } from "@/hooks/useOwnerStats";
import { User, Mail, Calendar, MapPin, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const OwnerProfile = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOwnerStats();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-400 to-red-500">
        <AppSidebar userRole="owner" />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-white/80">Manage your profile and business information</p>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid gap-6">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-600" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <div>
                            <label className="text-gray-600 text-sm font-medium">Email</label>
                            <p className="text-gray-800">{user?.email || 'Not available'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <div>
                            <label className="text-gray-600 text-sm font-medium">Member Since</label>
                            <p className="text-gray-800">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <div>
                          <label className="text-gray-600 text-sm font-medium">Business Location</label>
                          <p className="text-gray-600">Not set - Click edit to add your business location</p>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setShowEditDialog(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Business Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        Business Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <div className="text-center text-gray-600">Loading statistics...</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <motion.div 
                            className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-2xl font-bold text-orange-600 mb-2">{stats?.activeProperties || 0}</div>
                            <p className="text-gray-600">Active Properties</p>
                          </motion.div>
                          <motion.div 
                            className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-2xl font-bold text-orange-600 mb-2">{stats?.totalInquiries || 0}</div>
                            <p className="text-gray-600">Total Inquiries</p>
                          </motion.div>
                          <motion.div 
                            className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-2xl font-bold text-orange-600 mb-2">{stats?.activeMatches || 0}</div>
                            <p className="text-gray-600">Active Conversations</p>
                          </motion.div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Account Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-gray-800">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-800 font-medium">Subscription Plan</p>
                          <p className="text-gray-600">Free Plan - Limited features</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                        >
                          Upgrade Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <OwnerProfileDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </SidebarProvider>
  );
};

export default OwnerProfile;