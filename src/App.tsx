import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import SignupErrorBoundary from "@/components/SignupErrorBoundary";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Legal pages
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// Lazy load all dashboard and authenticated pages for better performance
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const ClientSettings = lazy(() => import("./pages/ClientSettings"));
const ClientLikedProperties = lazy(() => import("./pages/ClientLikedProperties"));
const ClientSavedSearches = lazy(() => import("./pages/ClientSavedSearches"));
const ClientSecurity = lazy(() => import("./pages/ClientSecurity"));
const EnhancedOwnerDashboard = lazy(() => import("./components/EnhancedOwnerDashboard"));
const OwnerProfile = lazy(() => import("./pages/OwnerProfile"));
const OwnerSettings = lazy(() => import("./pages/OwnerSettings"));
const OwnerSavedSearches = lazy(() => import("./pages/OwnerSavedSearches"));
const OwnerSecurity = lazy(() => import("./pages/OwnerSecurity"));
const MessagingDashboard = lazy(() => import("./pages/MessagingDashboard").then(m => ({ default: m.MessagingDashboard })));
const OwnerProperties = lazy(() => import("./pages/OwnerProperties"));
const OwnerNewListing = lazy(() => import("./pages/OwnerNewListing"));
const OwnerLikedClients = lazy(() => import("./pages/OwnerLikedClients"));
const ClientContracts = lazy(() => import("./pages/ClientContracts"));
const OwnerContracts = lazy(() => import("./pages/OwnerContracts"));
const SubscriptionPackagesPage = lazy(() => import("./pages/SubscriptionPackagesPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const OwnerPropertyClientDiscovery = lazy(() => import("./pages/OwnerPropertyClientDiscovery"));
const OwnerMotoClientDiscovery = lazy(() => import("./pages/OwnerMotoClientDiscovery"));
const OwnerBicycleClientDiscovery = lazy(() => import("./pages/OwnerBicycleClientDiscovery"));
const OwnerYachtClientDiscovery = lazy(() => import("./pages/OwnerYachtClientDiscovery"));
const OwnerVehicleClientDiscovery = lazy(() => import("./pages/OwnerVehicleClientDiscovery"));
const OwnerViewClientProfile = lazy(() => import("./pages/OwnerViewClientProfile"));
const OwnerFiltersExplore = lazy(() => import("./pages/OwnerFiltersExplore"));
const OwnerServicesDiscovery = lazy(() => import("./pages/OwnerServicesDiscovery"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  useNotifications();
  return <>{children}</>;
}

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ErrorBoundary>
          <AuthProvider>
          <ThemeProvider>
            <NotificationWrapper>
              <AppLayout>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Suspense fallback={<AppLoadingScreen />}>
                    <Routes>
                    <Route path="/" element={
                      <SignupErrorBoundary>
                        <Index />
                      </SignupErrorBoundary>
                    } />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
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
                      path="/owner/listings/new" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerNewListing />
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
                      path="/owner/clients/property" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerPropertyClientDiscovery />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/owner/clients/moto" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerMotoClientDiscovery />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/owner/clients/bicycle" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerBicycleClientDiscovery />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route
                      path="/owner/clients/yacht"
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerYachtClientDiscovery />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/owner/clients/vehicle"
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerVehicleClientDiscovery />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/owner/view-client/:clientId" 
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerViewClientProfile />
                        </ProtectedRoute>
                      } 
                    />

                    <Route
                      path="/owner/filters-explore"
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerFiltersExplore />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/owner/services"
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerServicesDiscovery />
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

                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/cancel" element={<PaymentCancel />} />

                    {/* Notifications Page - Both Roles */}
                    <Route 
                      path="/notifications" 
                      element={
                        <ProtectedRoute>
                          <NotificationsPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Legal Pages - Public Access */}
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </TooltipProvider>
              </AppLayout>
            </NotificationWrapper>
          </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
      <PerformanceMonitor />
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;