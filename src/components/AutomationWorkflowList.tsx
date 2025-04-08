
import React, { useState } from "react";
import { AutomationWorkflow } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Code, GitBranch, ArrowUpDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AutomationWorkflowListProps {
  workflows: AutomationWorkflow[];
  isLoading: boolean;
  onToggleActive?: (workflowId: string, isActive: boolean) => Promise<void>;
}

const AutomationWorkflowList: React.FC<AutomationWorkflowListProps> = ({
  workflows,
  isLoading,
  onToggleActive
}) => {
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  
  const handleToggleActive = async (workflowId: string, currentStatus: boolean) => {
    try {
      if (onToggleActive) {
        await onToggleActive(workflowId, !currentStatus);
        toast.success(`Workflow ${!currentStatus ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      console.error("Error toggling workflow status:", error);
      toast.error("Failed to update workflow status");
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading workflows...</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  if (workflows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            You don't have any automation workflows yet. Create one to get started.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Automation Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border border-gray-700 rounded-lg bg-gray-800/50"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium flex items-center">
                    <GitBranch className="h-4 w-4 mr-2 text-blue-400" />
                    {workflow.name}
                    <Badge className="ml-2" variant={workflow.isActive ? "default" : "outline"}>
                      {workflow.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{workflow.description}</p>
                </div>
                
                <Switch 
                  checked={workflow.isActive} 
                  onCheckedChange={() => handleToggleActive(workflow.id, workflow.isActive)}
                />
              </div>
              
              <div className="bg-gray-900 rounded-md p-3 mb-3">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-purple-400" />
                  Triggers ({workflow.triggers.length})
                </h4>
                
                <div className="space-y-2">
                  {workflow.triggers.map((trigger) => (
                    <div key={trigger.id} className="text-xs p-2 bg-gray-800 rounded border border-gray-700">
                      <div className="font-mono text-green-400">{trigger.type}</div>
                      <div className="text-gray-400 mt-1">{trigger.condition}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-md p-3 mb-3">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <Activity className="h-4 w-4 mr-2 text-orange-400" />
                  Actions ({workflow.actions.length})
                </h4>
                
                <div className="space-y-2">
                  {workflow.actions.map((action) => (
                    <div key={action.id} className="text-xs p-2 bg-gray-800 rounded border border-gray-700">
                      <div className="font-mono text-blue-400">{action.type}: {action.name}</div>
                      <div className="text-gray-400 mt-1 line-clamp-2 overflow-hidden">
                        {action.parameters.content 
                          ? action.parameters.content.substring(0, 100) + '...' 
                          : JSON.stringify(action.parameters)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Created: {workflow.createdAt.toLocaleString()}</span>
                <Button size="sm" variant="ghost" onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}>
                  <Code className="h-3 w-3 mr-1" />
                  {expandedWorkflow === workflow.id ? "Hide Details" : "View Details"}
                </Button>
              </div>

              {expandedWorkflow === workflow.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-3 bg-gray-900 rounded-md"
                >
                  <h4 className="text-sm font-medium mb-2">Workflow Details</h4>
                  <pre className="text-xs bg-gray-800 p-2 rounded overflow-x-auto">
                    {workflow.actions.map(action => action.parameters.content || JSON.stringify(action.parameters, null, 2)).join('\n\n')}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationWorkflowList;
