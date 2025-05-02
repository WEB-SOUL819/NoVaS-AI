
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Brain, 
  Star, 
  Shield, 
  Dices, 
  Zap, 
  ChevronDown,
  Lock
} from "lucide-react";
import { useDevMode } from "@/contexts/DevModeContext";
import { UserRole } from "@/types/roles";
import { Badge } from "./ui/badge";

export type AIMode = 'assistant' | 'oracle' | 'alfred' | 'hacker' | 'pentester' | 'analyst';

interface AiModeSelectorProps {
  currentMode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

const AIModeSelector: React.FC<AiModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const { isDevMode, userRole } = useDevMode();
  
  // Define all available modes with their access restrictions
  const modes = [
    { 
      id: 'assistant' as AIMode,
      name: 'Assistant', 
      description: 'General purpose AI assistant',
      icon: <Brain className="h-4 w-4 mr-2" />,
      requiredRole: 'user' as UserRole
    },
    { 
      id: 'oracle' as AIMode,
      name: 'Oracle', 
      description: 'Knowledge-focused prediction mode',
      icon: <Star className="h-4 w-4 mr-2" />,
      requiredRole: 'user' as UserRole
    },
    { 
      id: 'alfred' as AIMode,
      name: 'Alfred', 
      description: 'Personal butler and task management mode',
      icon: <Shield className="h-4 w-4 mr-2" />,
      requiredRole: 'user' as UserRole
    },
    { 
      id: 'hacker' as AIMode, 
      name: 'Hacker', 
      description: 'For ethical hacking and security research',
      icon: <Zap className="h-4 w-4 mr-2" />,
      requiredRole: 'admin' as UserRole
    },
    { 
      id: 'pentester' as AIMode,
      name: 'PenTester', 
      description: 'Advanced security testing mode',
      icon: <Dices className="h-4 w-4 mr-2" />,
      requiredRole: 'owner' as UserRole
    },
    { 
      id: 'analyst' as AIMode,
      name: 'Analyst', 
      description: 'Data analysis and intelligence gathering',
      icon: <Lock className="h-4 w-4 mr-2" />,
      requiredRole: 'owner' as UserRole
    }
  ];

  // Check if user has access to a specific mode
  const canAccessMode = (requiredRole: UserRole): boolean => {
    if (requiredRole === 'user') return true;
    if (requiredRole === 'admin') return userRole === 'admin' || userRole === 'owner';
    if (requiredRole === 'owner') return userRole === 'owner';
    return false;
  };

  // Get current mode info
  const currentModeInfo = modes.find(m => m.id === currentMode) || modes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentModeInfo.icon}
          <span>{currentModeInfo.name}</span>
          <Badge 
            variant={isDevMode ? "outline" : "secondary"}
            className="ml-2 text-xs px-1"
          >
            Mode
          </Badge>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select AI Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {modes.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            onClick={() => canAccessMode(mode.requiredRole) && onModeChange(mode.id)}
            disabled={!canAccessMode(mode.requiredRole)}
            className={`flex items-center ${
              currentMode === mode.id ? "bg-accent/50" : ""
            } ${!canAccessMode(mode.requiredRole) ? "opacity-50" : ""}`}
          >
            <div className="flex items-center">
              {mode.icon}
              <div>
                <p>{mode.name}</p>
                <p className="text-xs text-muted-foreground">{mode.description}</p>
              </div>
              {!canAccessMode(mode.requiredRole) && (
                <Lock className="h-3 w-3 ml-auto text-muted-foreground" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AIModeSelector;
