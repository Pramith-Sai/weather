
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Today from "./pages/Today";
import Hourly from "./pages/Hourly";
import SevenDay from "./pages/SevenDay";
import Radar from "./pages/Radar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const { session } = useAuth();

  // Load saved location on initial render or auth state change
  useEffect(() => {
    const loadSavedLocation = async () => {
      if (session.user && !session.isLoading) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("location_id")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;
          
          if (data && data.location_id) {
            setLocationId(data.location_id);
          }
        } catch (err) {
          console.error("Error loading saved location:", err);
        }
      }
    };

    loadSavedLocation();
  }, [session.user, session.isLoading]);

  // Handler for location selection that will be passed down to components
  const handleLocationSelect = (newLocationId: string) => {
    setLocationId(newLocationId);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index onLocationSelect={handleLocationSelect} locationId={locationId} />} />
        <Route path="/today" element={<Today onLocationSelect={handleLocationSelect} locationId={locationId} />} />
        <Route path="/hourly" element={<Hourly onLocationSelect={handleLocationSelect} locationId={locationId} />} />
        <Route path="/seven-day" element={<SevenDay onLocationSelect={handleLocationSelect} locationId={locationId} />} />
        <Route path="/radar" element={<Radar onLocationSelect={handleLocationSelect} locationId={locationId} />} />
        <Route path="/auth" element={<Auth />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
