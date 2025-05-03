
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, Settings as SettingsIcon, LogOut, BrainCircuit, History, Sidebar } from "lucide-react";
import { SYSTEM_CONFIG } from "@/config/env";
import AssistantAvatar from "@/components/AssistantAvatar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  isDevMode: boolean;
  userRole: string;
  onSignOut: () => void;
  onToggleSystemPanel?: () => void;
  showSystemPanelButton?: boolean;
  isMobile?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  isDevMode, 
  userRole, 
  onSignOut,
  onToggleSystemPanel,
  showSystemPanelButton = false,
  isMobile = false
}) => {
  return (
    <header className="p-4 border-b border-gray-800 glass-panel sticky top-0 z-10">
      <div className={`container flex items-center ${isMobile ? "justify-between" : "justify-between"}`}>
        <div className="flex items-center space-x-3">
          <AssistantAvatar size="sm" />
          <h1 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-white`}>
            {SYSTEM_CONFIG.ASSISTANT_NAME}
            {!isMobile && <span className="text-xs text-gray-400 ml-2">v{SYSTEM_CONFIG.SYSTEM_VERSION}</span>}
            {isDevMode && (
              <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                {userRole}
              </span>
            )}
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-primary hover:text-white text-sm font-medium transition-colors">
            Dashboard
          </Link>
          <Link to="/automation" className="text-gray-400 hover:text-white text-sm transition-colors">
            Automation
          </Link>
          <Link to="/history" className="text-gray-400 hover:text-white text-sm transition-colors">
            History
          </Link>
          <Link to="/profile" className="text-gray-400 hover:text-white text-sm transition-colors">
            Profile
          </Link>
          <Link to="/settings" className="text-gray-400 hover:text-white text-sm transition-colors">
            Settings
          </Link>
          <ThemeSwitcher />
        </nav>
        
        <div className="md:hidden flex items-center space-x-2">
          {showSystemPanelButton && onToggleSystemPanel && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onToggleSystemPanel}
              className="mr-1"
            >
              <Sidebar className="h-5 w-5" />
            </Button>
          )}
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="cursor-pointer">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/automation" className="cursor-pointer">
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Automation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/history" className="cursor-pointer">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
