import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { TrailersPage } from "./trailers/TrailersPage.tsx";
import { DirectionalDrillTiltTrailerDetails } from "./trailers/DirectionalDrillTiltTrailerDetails.tsx";
import { DirectionalDrillTiltTrailer3DPage } from "./trailers/DirectionalDrillTiltTrailer3DPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trailers" element={<TrailersPage />} />
          <Route path="/trailers/:slug" element={<DirectionalDrillTiltTrailerDetails />} />
          <Route path="/trailers/:slug/3d" element={<DirectionalDrillTiltTrailer3DPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
