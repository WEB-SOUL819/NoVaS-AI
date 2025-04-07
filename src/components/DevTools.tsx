
import React, { useState } from "react";
import { useDevMode } from "@/contexts/DevModeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole, ROLE_PERMISSIONS } from "@/types/roles";
import { Code, Cpu, Database, Shield, Terminal, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DevTools = () => {
  const { isDevMode, toggleDevMode, userRole, setUserRole } = useDevMode();
  const [isOpen, setIsOpen] = useState(false);
  const [debugLevel, setDebugLevel] = useState("info");
  
  if (!isDevMode) return null;
  
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    toast.success(`Role changed to ${newRole}`);
  };
  
  const clearLocalStorage = () => {
    localStorage.clear();
    toast.success("Local storage cleared");
  };
  
  const simulateError = () => {
    try {
      throw new Error("This is a simulated error");
    } catch (error) {
      toast.error("Simulated Error", {
        description: (error as Error).message,
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 bg-black/40 border-purple-500 hover:bg-black/60 z-50"
        >
          <Terminal className="h-4 w-4 text-purple-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-400" />
            NoVaS Developer Tools
            <Badge className="ml-2 bg-purple-600">{userRole}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="system">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="devmode" checked={isDevMode} onCheckedChange={toggleDevMode} />
                <Label htmlFor="devmode">Developer Mode</Label>
              </div>
              
              <Select value={userRole} onValueChange={(value) => handleRoleChange(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button variant="outline" onClick={() => toast.success("System status refreshed")}>
                <Cpu className="mr-2 h-4 w-4" />
                Refresh System
              </Button>
              <Button variant="outline" onClick={clearLocalStorage}>
                <Terminal className="mr-2 h-4 w-4" />
                Clear Local Storage
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-black/20 rounded-md">
              <h3 className="text-sm font-semibold mb-2">System Information</h3>
              <div className="text-xs space-y-1 font-mono">
                <p>Version: {SYSTEM_CONFIG.SYSTEM_VERSION}</p>
                <p>Environment: Development</p>
                <p>Build: {new Date().toISOString().split('T')[0]}</p>
                <p>User Role: {userRole}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Accordion type="single" collapsible className="w-full">
              {ROLE_PERMISSIONS.map((rolePermission) => (
                <AccordionItem value={rolePermission.role} key={rolePermission.role}>
                  <AccordionTrigger className="flex items-center">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      {rolePermission.role.charAt(0).toUpperCase() + rolePermission.role.slice(1)}
                      <Badge className="ml-2" variant="outline">{rolePermission.permissions.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {rolePermission.permissions.map((permission) => (
                        <div key={permission.id} className="flex justify-between items-center p-2 bg-black/20 rounded-md">
                          <div>
                            <p className="text-sm font-medium">{permission.name}</p>
                            <p className="text-xs text-gray-400">{permission.description}</p>
                          </div>
                          <Badge>{permission.id}</Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          
          <TabsContent value="database" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" disabled>
                <Database className="mr-2 h-4 w-4" />
                View Database Schema
              </Button>
              <Button variant="outline" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Run Migrations
              </Button>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Tables</h3>
              <div className="space-y-2">
                {['profiles', 'conversations', 'messages', 'system_status', 'modules'].map((table) => (
                  <div key={table} className="p-2 bg-black/20 rounded-md flex justify-between">
                    <span className="text-sm">{table}</span>
                    <Badge variant="outline">table</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select value={debugLevel} onValueChange={setDebugLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Debug Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={simulateError}>
                Simulate Error
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-black/20 rounded-md h-40 overflow-y-auto font-mono text-xs">
              <p className="text-gray-400">[{new Date().toISOString()}] System initialized</p>
              <p className="text-purple-400">[{new Date().toISOString()}] Dev mode activated</p>
              <p className="text-gray-400">[{new Date().toISOString()}] User role: {userRole}</p>
              <p className="text-gray-400">[{new Date().toISOString()}] Debug level: {debugLevel}</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DevTools;
