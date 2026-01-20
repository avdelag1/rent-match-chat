import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuspenseFallback } from "@/components/ui/suspense-fallback";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";
import { ActiveModeProvider } from "@/hooks/useActiveMode";
import { PWAProvider } from "@/hooks/usePWAMode";
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
// INSTANT NAVIGATION: ALL core routes are DIRECT IMPORTS
// Lazy loading causes delay on first tap - we want INSTANT navigation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Client routes - ALL direct imports for instant navigation
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfileNew";
import ClientSettings from "./pages/ClientSettingsNew";
import ClientLikedProperties from "./pages/ClientLikedProperties";
import ClientSavedSearches from "./pages/ClientSavedSearches";
import ClientSecurity from "./pages/ClientSecurity";
import ClientWorkerDiscovery from "./pages/ClientWorkerDiscovery";
import ClientContracts from "./pages/ClientContracts";

// Owner routes - ALL direct imports for instant navigation
import EnhancedOwnerDashboard from "./components/EnhancedOwnerDashboard";
import OwnerProfile from "./pages/OwnerProfileNew";
import OwnerSettings from "./pages/OwnerSettingsNew";
import OwnerProperties from "./pages/OwnerProperties";
import OwnerNewListing from "./pages/OwnerNewListing";
import OwnerLikedClients from "./pages/OwnerLikedClients";
import OwnerContracts from "./pages/OwnerContracts";
import OwnerSavedSearches from "./pages/OwnerSavedSearches";
import OwnerSecurity from "./pages/OwnerSecurity";
import OwnerPropertyClientDiscovery from "./pages/OwnerPropertyClientDiscovery";
import OwnerMotoClientDiscovery from "./pages/OwnerMotoClientDiscovery";
import OwnerBicycleClientDiscovery from "./pages/OwnerBicycleClientDiscovery";
import OwnerYachtClientDiscovery from "./pages/OwnerYachtClientDiscovery";
import OwnerVehicleClientDiscovery from "./pages/OwnerVehicleClientDiscovery";
import OwnerViewClientProfile from "./pages/OwnerViewClientProfile";
import OwnerFiltersExplore from "./pages/OwnerFiltersExplore";

// Filter pages - direct imports for instant navigation
import ClientFilters from "./pages/ClientFilters";
import OwnerFilters from "./pages/OwnerFilters";

// Shared routes - direct imports for instant navigation
import { MessagingDashboard } from "./pages/MessagingDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import SubscriptionPackagesPage from "./pages/SubscriptionPackagesPage";

// Rare pages - lazy loaded (payment, camera, legal, public previews)
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));

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
          <ActiveModeProvider>
          <ThemeProvider>
            <PWAProvider>
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
                        SPEED OF LIGHT: UNIFIED layout for ALL protected routes
                        Single PersistentDashboardLayout instance shared between modes
                        Prevents remount when switching between client/owner modes
                        Camera routes are INSIDE layout to prevent remount on navigation back
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    <Route element={
                      <ProtectedRoute>
                        <PersistentDashboardLayout />
                      </ProtectedRoute>
                    }>
                      {/* Client routes */}
                      <Route path="/client/dashboard" element={<ClientDashboard />} />
                      <Route path="/client/profile" element={<ClientProfile />} />
                      <Route path="/client/settings" element={<ClientSettings />} />
                      <Route path="/client/liked-properties" element={<ClientLikedProperties />} />
                      <Route path="/client/saved-searches" element={<ClientSavedSearches />} />
                      <Route path="/client/security" element={<ClientSecurity />} />
                      <Route path="/client/services" element={<ClientWorkerDiscovery />} />
                      <Route path="/client/contracts" element={<ClientContracts />} />
                      <Route path="/client/camera" element={<ClientSelfieCamera />} />
                      <Route path="/client/filters" element={<ClientFilters />} />

                      {/* Owner routes */}
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
                      <Route path="/owner/camera" element={<OwnerProfileCamera />} />
                      <Route path="/owner/camera/listing" element={<OwnerListingCamera />} />
                      <Route path="/owner/filters" element={<OwnerFilters />} />

                      {/* Shared routes (both roles) */}
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
            </PWAProvider>
          </ThemeProvider>
          </ActiveModeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
