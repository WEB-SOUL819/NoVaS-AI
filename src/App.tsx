
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DevModeProvider } from "@/contexts/DevModeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import DevTools from "@/components/DevTools";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Automation from "./pages/Automation";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./pages/ContactUs";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Shorter loading time for the splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Reduced from 2500ms to 1500ms
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <DevModeProvider>
              {loading ? (
                <SplashScreen />
              ) : (
                <>
                  <Toaster />
                  <Sonner />
                  <DevTools />
                  <BrowserRouter>
                    <div className="flex flex-col min-h-screen">
                      <div className="flex-grow">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-of-service" element={<TermsOfService />} />
                          <Route path="/contact-us" element={<ContactUs />} />
                          <Route element={<AppLayout />}>
                            <Route 
                              path="/dashboard" 
                              element={
                                <ProtectedRoute>
                                  <Dashboard />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path="/profile" 
                              element={
                                <ProtectedRoute>
                                  <Profile />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path="/settings" 
                              element={
                                <ProtectedRoute>
                                  <Settings />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path="/automation" 
                              element={
                                <ProtectedRoute>
                                  <Automation />
                                </ProtectedRoute>
                              } 
                            />
                          </Route>
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </div>
                  </BrowserRouter>
                </>
              )}
            </DevModeProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
