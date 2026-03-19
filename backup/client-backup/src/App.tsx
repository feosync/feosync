import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/dashboard/Overview";
import Posts from "./pages/dashboard/Posts";
import CalendarPage from "./pages/dashboard/CalendarPage";
import Analytics from "./pages/dashboard/Analytics";
import AIGeneration from "./pages/dashboard/AIGeneration";
import PagesPage from "./pages/dashboard/PagesPage";
import Reviews from "./pages/dashboard/Reviews";
import Schedules from "./pages/dashboard/Schedules";
import SettingsPage from "./pages/dashboard/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Overview />} />
              <Route path="posts" element={<Posts />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="ai" element={<AIGeneration />} />
              <Route path="pages" element={<PagesPage />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
