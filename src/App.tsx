import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuspenseFallback } from "@/components/ui/suspense-fallback";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";
import { useNotifications } from "@/hooks/useNotifications";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import SignupErrorBoundary from "@/components/SignupErrorBoundary";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// SPEED OF LIGHT: Persistent layout wrapper - mounted ONCE, never remounts
import { PersistentDashboardLayout } from "@/components/PersistentDashboardLayout";

// Import UI components directly (not lazy) to avoid useContext issues with ThemeProvider
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Lazy load non-critical overlay components to reduce initial bundle size
const PWAInstallBanner = lazy(() => import("@/components/PWAInstallBanner").then(m => ({ default: m.PWAInstallBanner })));
const PerformanceMonitor = lazy(() => import("@/components/PerformanceMonitor").then(m => ({ default: m.PerformanceMonitor })));

// Lazy load pages that are not immediately needed
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Legal pages
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPEED OF LIGHT: Critical routes are DIRECT IMPORTS (not lazy)
// These are the most frequently accessed pages - they must be instant
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import ClientDashboard from "./pages/ClientDashboard";
import EnhancedOwnerDashboard from "./components/EnhancedOwnerDashboard";
import { MessagingDashboard } from "./pages/MessagingDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import ClientProfile from "./pages/ClientProfileNew";
import OwnerProfile from "./pages/OwnerProfileNew";
import ClientLikedProperties from "./pages/ClientLikedProperties";
import OwnerLikedClients from "./pages/OwnerLikedClients";

// Secondary routes - lazy loaded (less frequently accessed)
const ClientSettings = lazy(() => import("./pages/ClientSettingsNew"));
const ClientSavedSearches = lazy(() => import("./pages/ClientSavedSearches"));
const ClientSecurity = lazy(() => import("./pages/ClientSecurity"));
const OwnerSettings = lazy(() => import("./pages/OwnerSettingsNew"));
const OwnerSavedSearches = lazy(() => import("./pages/OwnerSavedSearches"));
const OwnerSecurity = lazy(() => import("./pages/OwnerSecurity"));
const OwnerProperties = lazy(() => import("./pages/OwnerProperties"));
const OwnerNewListing = lazy(() => import("./pages/OwnerNewListing"));
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
const ClientWorkerDiscovery = lazy(() => import("./pages/ClientWorkerDiscovery"));

// Camera pages
const ClientSelfieCamera = lazy(() => import("./pages/ClientSelfieCamera"));
const OwnerListingCamera = lazy(() => import("./pages/OwnerListingCamera"));
const OwnerProfileCamera = lazy(() => import("./pages/OwnerProfileCamera"));

// Public preview pages (shareable links)
const PublicProfilePreview = lazy(() => import("./pages/PublicProfilePreview"));
const PublicListingPreview = lazy(() => import("./pages/PublicListingPreview"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      networkMode: 'offlineFirst', // Better offline support
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
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
            <ResponsiveProvider>
            <NotificationWrapper>
              <AppLayout>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
                <Suspense fallback={<SuspenseFallback />}>
                  <Routes>
                    <Route path="/" element={
                      <SignupErrorBoundary>
                        <Index />
                      </SignupErrorBoundary>
                    } />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        SPEED OF LIGHT: Client routes with PERSISTENT layout
                        DashboardLayout is mounted ONCE and never remounts
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    <Route element={
                      <ProtectedRoute requiredRole="client">
                        <PersistentDashboardLayout requiredRole="client" />
                      </ProtectedRoute>
                    }>
                      <Route path="/client/dashboard" element={<ClientDashboard />} />
                      <Route path="/client/profile" element={<ClientProfile />} />
                      <Route path="/client/settings" element={<ClientSettings />} />
                      <Route path="/client/liked-properties" element={<ClientLikedProperties />} />
                      <Route path="/client/saved-searches" element={<ClientSavedSearches />} />
                      <Route path="/client/security" element={<ClientSecurity />} />
                      <Route path="/client/services" element={<ClientWorkerDiscovery />} />
                      <Route path="/client/contracts" element={<ClientContracts />} />
                    </Route>

                    {/* Client Camera - outside layout (fullscreen) */}
                    <Route
                      path="/client/camera"
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientSelfieCamera />
                        </ProtectedRoute>
                      }
                    />

                    {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        SPEED OF LIGHT: Owner routes with PERSISTENT layout
                        DashboardLayout is mounted ONCE and never remounts
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    <Route element={
                      <ProtectedRoute requiredRole="owner">
                        <PersistentDashboardLayout requiredRole="owner" />
                      </ProtectedRoute>
                    }>
                      <Route path="/owner/dashboard" element={<EnhancedOwnerDashboard />} />
                      <Route path="/owner/profile" element={<OwnerProfile />} />
                      <Route path="/owner/settings" element={<OwnerSettings />} />
                      <Route path="/owner/properties" element={<OwnerProperties />} />
                      <Route path="/owner/listings/new" element={<OwnerNewListing />} />
                      <Route path="/owner/liked-clients" element={<OwnerLikedClients />} />
                      <Route path="/owner/clients/property" element={<OwnerPropertyClientDiscovery />} />
                      <Route path="/owner/clients/moto" element={<OwnerMotoClientDiscovery />} />
                      <Route path="/owner/clients/bicycle" element={<OwnerBicycleClientDiscovery />} />
                      <Route path="/owner/clients/yacht" element={<OwnerYachtClientDiscovery />} />
                      <Route path="/owner/clients/vehicle" element={<OwnerVehicleClientDiscovery />} />
                      <Route path="/owner/view-client/:clientId" element={<OwnerViewClientProfile />} />
                      <Route path="/owner/filters-explore" element={<OwnerFiltersExplore />} />
                      <Route path="/owner/saved-searches" element={<OwnerSavedSearches />} />
                      <Route path="/owner/security" element={<OwnerSecurity />} />
                      <Route path="/owner/contracts" element={<OwnerContracts />} />
                    </Route>

                    {/* Owner Camera Routes - outside layout (fullscreen) */}
                    <Route
                      path="/owner/camera"
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerProfileCamera />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/owner/camera/listing"
                      element={
                        <ProtectedRoute requiredRole="owner">
                          <OwnerListingCamera />
                        </ProtectedRoute>
                      }
                    />

                    {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        Shared routes (both roles) with PERSISTENT layout
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    <Route element={
                      <ProtectedRoute>
                        <PersistentDashboardLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="/messages" element={<MessagingDashboard />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/subscription-packages" element={<SubscriptionPackagesPage />} />
                    </Route>

                    {/* Payment routes - outside layout */}
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/cancel" element={<PaymentCancel />} />

                    {/* Legal Pages - Public Access */}
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />

                    {/* Public Preview Pages - Shareable Links */}
                    <Route path="/profile/:id" element={<PublicProfilePreview />} />
                    <Route path="/listing/:id" element={<PublicListingPreview />} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AppLayout>
              {/* Lazy-loaded overlay components - loaded after initial render */}
              <Suspense fallback={null}>
                <PWAInstallBanner />
                <PerformanceMonitor />
              </Suspense>
            </NotificationWrapper>
            </ResponsiveProvider>
          </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
