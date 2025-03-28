
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import BorrowingCapacity from "./pages/BorrowingCapacity";
import FinanceCalculator from "./pages/FinanceCalculator";
import PortfolioManager from "./pages/PortfolioManager";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import AdminClientView from "./pages/AdminClientView";
import AdminPropertyEdit from "./pages/AdminPropertyEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/borrowing-capacity" element={<BorrowingCapacity />} />
            <Route path="/finance-calculator" element={<FinanceCalculator />} />
            <Route path="/portfolio-manager" element={<PortfolioManager />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/property/:propertyId" element={<PropertyDetails />} />
            
            {/* Admin routes */}
            <Route path="/admin/client/:clientId" element={<AdminClientView />} />
            <Route path="/admin/property/:propertyId" element={<AdminPropertyEdit />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
