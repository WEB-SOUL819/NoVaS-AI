
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSwitcher from "./ThemeSwitcher";

const AppLayout: React.FC = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nova-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
