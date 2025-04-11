
import { useState, useEffect } from "react";
import { AutomationTask, AutomationWorkflow } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeForAutomation, generateAutomationWorkflow } from "@/utils/automationUtils";
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
      
      // Try to fetch from Supabase 
      const { data, error } = await supabase
        .from('automation_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn("Could not fetch from Supabase, using localStorage fallback:", error);
        
        // Fallback to localStorage
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
      } else if (data) {
        // Format Supabase data
        const formattedTasks = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.type as "reminder" | "schedule" | "trigger" | "workflow",
          details: item.details,
          status: item.status as "pending" | "active" | "completed" | "failed",
          createdAt: new Date(item.created_at),
          completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
          schedule: item.schedule,
          triggerCondition: item.trigger_condition,
          actions: item.actions ? JSON.parse(JSON.stringify(item.actions)) : undefined
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
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn("Could not fetch from Supabase, using localStorage fallback:", error);
        
        // Fallback to localStorage
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
      } else if (data) {
        // Format Supabase data
        const formattedWorkflows = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          triggers: JSON.parse(JSON.stringify(item.triggers)),
          actions: JSON.parse(JSON.stringify(item.actions)),
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          isActive: item.is_active
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
    if (!user) return null;
    
    try {
      // Format task for Supabase
      const taskData = {
        user_id: user.id,
        name: task.name,
        type: task.type,
        details: task.details,
        status: task.status,
        schedule: task.schedule,
        trigger_condition: task.triggerCondition,
        actions: task.actions ? task.actions : null
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('automation_tasks')
        .insert(taskData)
        .select('id')
        .single();
      
      if (error) {
        console.warn("Could not save to Supabase, using localStorage fallback:", error);
        
        // Add to local state
        const updatedTasks = [...tasks, task];
        setTasks(updatedTasks);
        
        // Fallback to localStorage
        localStorage.setItem(`automation_tasks_${user.id}`, JSON.stringify(updatedTasks));
      } else {
        // Add to local state with the DB-generated ID
        const newTask = { ...task, id: data.id };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
      }
      
      toast.success("Automation task created");
      return task;
    } catch (error) {
      console.error("Error saving automation task:", error);
      toast.error("Failed to save automation task");
      return null;
    }
  };

  const saveWorkflow = async (workflow: AutomationWorkflow) => {
    if (!user) return null;
    
    try {
      // Format workflow for Supabase
      const workflowData = {
        user_id: user.id,
        name: workflow.name,
        description: workflow.description,
        triggers: workflow.triggers,
        actions: workflow.actions,
        is_active: workflow.isActive
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert(workflowData)
        .select('id')
        .single();
      
      if (error) {
        console.warn("Could not save to Supabase, using localStorage fallback:", error);
        
        // Add to local state
        const updatedWorkflows = [...workflows, workflow];
        setWorkflows(updatedWorkflows);
        
        // Fallback to localStorage
        localStorage.setItem(`automation_workflows_${user.id}`, JSON.stringify(updatedWorkflows));
      } else {
        // Add to local state with the DB-generated ID
        const newWorkflow = { ...workflow, id: data.id };
        const updatedWorkflows = [...workflows, newWorkflow];
        setWorkflows(updatedWorkflows);
      }
      
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
      // Update in local state
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
      
      // Try to update in Supabase
      const { error } = await supabase
        .from('automation_tasks')
        .update({ 
          status, 
          completed_at: status === 'completed' ? new Date().toISOString() : null 
        })
        .eq('id', taskId);
      
      if (error) {
        console.warn("Could not update in Supabase, using localStorage fallback:", error);
        
        // Fallback to localStorage
        localStorage.setItem(`automation_tasks_${user.id}`, JSON.stringify(updatedTasks));
      }
      
      toast.success(`Task ${status}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const updateWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    if (!user) return;
    
    try {
      // Update in local state
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
      
      // Try to update in Supabase
      const { error } = await supabase
        .from('automation_workflows')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId);
      
      if (error) {
        console.warn("Could not update in Supabase, using localStorage fallback:", error);
        
        // Fallback to localStorage
        localStorage.setItem(`automation_workflows_${user.id}`, JSON.stringify(updatedWorkflows));
      }
      
      toast.success(`Workflow ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error updating workflow status:", error);
      toast.error("Failed to update workflow status");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      // Remove from local state
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Try to delete from Supabase
      const { error } = await supabase
        .from('automation_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.warn("Could not delete from Supabase, using localStorage fallback:", error);
        
        // Fallback to localStorage
        localStorage.setItem(`automation_tasks_${user.id}`, JSON.stringify(updatedTasks));
      }
      
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
