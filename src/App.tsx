
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import TelegramBot from "./pages/TelegramBot";
import JsonEvents from "./pages/JsonEvents";
import NotFound from "./pages/NotFound";
import EventPage from "./pages/EventPage";
import LavaLamp from "./pages/LavaLamp";
import { EventModalProvider } from "./contexts/EventModalContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="cosmic-agenda-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <EventModalProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/telegram-bot" element={<TelegramBot />} />
              <Route path="/json" element={<JsonEvents />} />
              <Route path="/lava-lamp" element={<LavaLamp />} />
              <Route path="/events" element={<Index />} />
              <Route path="/:eventId" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EventModalProvider>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
