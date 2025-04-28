import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import BorrowingCapacity from "./pages/BorrowingCapacity";
import MortgageCalculator from "./pages/MortgageCalculator";
import PortfolioManager from "./pages/PortfolioManager";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import AdminClientView from "./pages/AdminClientView";
import AdminPropertyEdit from "./pages/AdminPropertyEdit";
import AddProperty from "./pages/AddProperty";
import AssignProperty from "./pages/AssignProperty";
import NotFound from "./pages/NotFound";
import AdminClientForm from "./pages/AdminClientForm";
import HookTester from "./components/HookTester";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/borrowing-capacity" element={<BorrowingCapacity />} />
            <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
            <Route path="/portfolio-manager" element={<PortfolioManager />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/property/:propertyId" element={<PropertyDetails />} />
            
            {/* Admin routes */}
            <Route path="/admin/client/:clientId" element={<AdminClientView />} />
            <Route path="/admin/property/:propertyId" element={<AdminPropertyEdit />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/assign-property" element={<AssignProperty />} />
            <Route path="/admin-client-form" element={<AdminClientForm />} />
            <Route path="/admin-client-form/:clientId" element={<AdminClientForm />} />
            <Route path="/hooks-test" element={<HookTester />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
