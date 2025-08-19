import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Trading from "./pages/Trading";
import Pronostic from "./pages/Pronostic";
import Social from "./pages/Social";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import AnalysisRequest from "./pages/AnalysisRequest";
import PronosticRequest from "./pages/PronosticRequest";
import AnalysisDetails from "./pages/AnalysisDetails";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import {NewsCarousel}  from './components/NewsCarousel';

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
            <Route path="/trading" element={<Trading />} />
            <Route path="/pronostic" element={<Pronostic />} />
            <Route path="/social" element={<Social />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/analysis-request" element={<AnalysisRequest />} />
            <Route path="/pronostic-request" element={<PronosticRequest />} />
            <Route path="/analysis/:id" element={<AnalysisDetails />} />
            <Route path="/payment/:articleId" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;