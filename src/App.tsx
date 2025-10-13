import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientSettings from "./pages/ClientSettings";
import ClientLikedProperties from "./pages/ClientLikedProperties";
import ClientSavedSearches from "./pages/ClientSavedSearches";
import ClientMatchHistory from "./pages/ClientMatchHistory";
import ClientActivityFeed from "./pages/ClientActivityFeed";
import ClientSecurity from "./pages/ClientSecurity";
import EnhancedOwnerDashboard from "./components/EnhancedOwnerDashboard";
import OwnerProfile from "./pages/OwnerProfile";
import OwnerSettings from "./pages/OwnerSettings";
import OwnerSavedSearches from "./pages/OwnerSavedSearches";
import OwnerMatchHistory from "./pages/OwnerMatchHistory";
import OwnerActivityFeed from "./pages/OwnerActivityFeed";
import OwnerSecurity from "./pages/OwnerSecurity";
import { MessagingDashboard } from "./pages/MessagingDashboard";
import OwnerProperties from "./pages/OwnerProperties";
import OwnerLikedClients from "./pages/OwnerLikedClients";
import ClientContracts from "./pages/ClientContracts";
import OwnerContracts from "./pages/OwnerContracts";
import SubscriptionPackagesPage from "./pages/SubscriptionPackagesPage";

const queryClient = new QueryClient();

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  useNotifications();
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <ThemeProvider>
            <NotificationWrapper>
              <AppLayout>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    
                    <Route 
                      path="/onboarding" 
                      element={
                        <ProtectedRoute>
                          <Onboarding />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/client/dashboard" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/client/profile" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientProfile />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/client/settings" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientSettings />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/client/liked-properties" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientLikedProperties />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/client/saved-searches" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientSavedSearches />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/client/match-history" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientMatchHistory />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/client/activity-feed" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientActivityFeed />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/client/security" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientSecurity />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/owner/dashboard" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <EnhancedOwnerDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/profile" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerProfile />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/settings" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerSettings />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/properties" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerProperties />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/liked-clients" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerLikedClients />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/saved-searches" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerSavedSearches />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/match-history" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerMatchHistory />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/activity-feed" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerActivityFeed />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/security" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerSecurity />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/messages" 
                      element={
                        <ProtectedRoute>
                          <MessagingDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/client/contracts" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientContracts />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/owner/contracts" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerContracts />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/subscription-packages" 
                      element={
                        <ProtectedRoute>
                          <SubscriptionPackagesPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </AppLayout>
            </NotificationWrapper>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;