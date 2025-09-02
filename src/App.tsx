
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientSettings from "./pages/ClientSettings";
import ClientLikedProperties from "./pages/ClientLikedProperties";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProfile from "./pages/OwnerProfile";
import OwnerSettings from "./pages/OwnerSettings";
import MessagingDashboard from "./pages/MessagingDashboard";
import OwnerProperties from "./pages/OwnerProperties";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            
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
              path="/owner/dashboard" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard />
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
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagingDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
