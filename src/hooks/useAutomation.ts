
import { useState, useEffect } from "react";
import { AutomationTask, AutomationWorkflow } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeForAutomation, generateAutomationWorkflow } from "@/utils/ai";
import { toast } from "sonner";

export const useAutomation = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchWorkflows();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from the database
      // For now, we'll use localStorage as a temporary solution
      const storedTasks = localStorage.getItem(`automation_tasks_${user.id}`);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Convert string dates back to Date objects
        const formattedTasks = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching automation tasks:", error);
      toast.error("Failed to load automation tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from the database
      // For now, we'll use localStorage as a temporary solution
      const storedWorkflows = localStorage.getItem(`automation_workflows_${user.id}`);
      if (storedWorkflows) {
        const parsedWorkflows = JSON.parse(storedWorkflows);
        // Convert string dates back to Date objects
        const formattedWorkflows = parsedWorkflows.map((workflow: any) => ({
          ...workflow,
          createdAt: new Date(workflow.createdAt),
          updatedAt: new Date(workflow.updatedAt)
        }));
        setWorkflows(formattedWorkflows);
      }
    } catch (error) {
      console.error("Error fetching automation workflows:", error);
      toast.error("Failed to load automation workflows");
    } finally {
      setIsLoading(false);
    }
  };

  const saveTask = async (task: AutomationTask) => {
    if (!user) return;
    
    try {
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      
      // Save to localStorage (temporary solution)
      localStorage.setItem(`automation_tasks_${user.id}`, JSON.stringify(updatedTasks));
      
      toast.success("Automation task created");
      return task;
    } catch (error) {
      console.error("Error saving automation task:", error);
      toast.error("Failed to save automation task");
      return null;
    }
  };

  const saveWorkflow = async (workflow: AutomationWorkflow) => {
    if (!user) return;
    
    try {
      const updatedWorkflows = [...workflows, workflow];
      setWorkflows(updatedWorkflows);
      
      // Save to localStorage (temporary solution)
      localStorage.setItem(`automation_workflows_${user.id}`, JSON.stringify(updatedWorkflows));
      
      toast.success("Automation workflow created");
      return workflow;
    } catch (error) {
      console.error("Error saving automation workflow:", error);
      toast.error("Failed to save automation workflow");
      return null;
    }
  };

  const updateTaskStatus = async (taskId: string, status: AutomationTask['status']) => {
    if (!user) return;
    
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status, 
              completedAt: status === 'completed' ? new Date() : task.completedAt 
            } 
          : task
      );
      
      setTasks(updatedTasks);
      
      // Save to localStorage (temporary solution)
      localStorage.setItem(`automation_tasks_${user.id}`, JSON.stringify(updatedTasks));
      
      toast.success(`Task ${status}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const updateWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    if (!user) return;
    
    try {
      const updatedWorkflows = workflows.map(workflow => 
        workflow.id === workflowId 
          ? { 
              ...workflow, 
              isActive,
              updatedAt: new Date()
            } 
          : workflow
      );
      
      setWorkflows(updatedWorkflows);
      
      // Save to localStorage (temporary solution)
      localStorage.setItem(`automation_workflows_${user.id}`, JSON.stringify(updatedWorkflows));
      
      toast.success(`Workflow ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error updating workflow status:", error);
      toast.error("Failed to update workflow status");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Save to localStorage (temporary solution)
      localStorage.setItem(`automation_tasks_${user.id}`, JSON.stringify(updatedTasks));
      
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const analyzeText = async (text: string) => {
    if (!text.trim()) return [];
    
    try {
      setIsAnalyzing(true);
      const automationTasks = await analyzeForAutomation(text);
      return automationTasks;
    } catch (error) {
      console.error("Error analyzing text for automation:", error);
      toast.error("Failed to analyze text for automation opportunities");
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createWorkflowFromRequest = async (request: string, name: string) => {
    if (!user || !request.trim() || !name.trim()) return null;
    
    try {
      setIsLoading(true);
      const workflowContent = await generateAutomationWorkflow(request);
      
      const newWorkflow: AutomationWorkflow = {
        id: crypto.randomUUID(),
        name,
        description: request,
        triggers: [
          {
            id: crypto.randomUUID(),
            type: "manual",
            condition: "User initiated",
            parameters: {}
          }
        ],
        actions: [
          {
            id: crypto.randomUUID(),
            name: "Generated Workflow",
            type: "custom",
            parameters: { content: workflowContent }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      return await saveWorkflow(newWorkflow);
    } catch (error) {
      console.error("Error creating workflow from request:", error);
      toast.error("Failed to create workflow");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tasks,
    workflows,
    isLoading,
    isAnalyzing,
    fetchTasks,
    fetchWorkflows,
    saveTask,
    saveWorkflow,
    updateTaskStatus,
    updateWorkflowStatus,
    deleteTask,
    analyzeText,
    createWorkflowFromRequest
  };
};
