import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAutomation } from "@/hooks/useAutomation";
import { AutomationTask, AutomationWorkflow } from "@/types";
import { Plus, ArrowRight, BrainCircuit, List, GitBranch, Zap } from "lucide-react";
import AutomationTaskList from "@/components/AutomationTaskList";
import AutomationWorkflowList from "@/components/AutomationWorkflowList";
import AutomationAssistant from "@/components/AutomationAssistant";
import { toast } from "sonner";

const Automation = () => {
  const {
    tasks,
    workflows,
    isLoading,
    isAnalyzing,
    saveTask,
    updateTaskStatus,
    deleteTask,
    analyzeText,
    createWorkflowFromRequest
  } = useAutomation();
  
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskType, setNewTaskType] = useState<AutomationTask["type"]>("reminder");
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowRequest, setNewWorkflowRequest] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [suggestedTasks, setSuggestedTasks] = useState<AutomationTask[]>([]);
  
  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !newTaskDetails.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const task: AutomationTask = {
      id: crypto.randomUUID(),
      name: newTaskName,
      type: newTaskType,
      details: newTaskDetails,
      status: "pending",
      createdAt: new Date()
    };
    
    await saveTask(task);
    
    // Reset form
    setNewTaskName("");
    setNewTaskType("reminder");
    setNewTaskDetails("");
  };
  
  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim() || !newWorkflowRequest.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    await createWorkflowFromRequest(newWorkflowRequest, newWorkflowName);
    
    // Reset form
    setNewWorkflowName("");
    setNewWorkflowRequest("");
  };
  
  const handleAnalyzeText = async () => {
    if (!analysisText.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }
    
    const tasks = await analyzeText(analysisText);
    setSuggestedTasks(tasks);
  };
  
  const handleAddSuggestedTask = async (task: AutomationTask) => {
    await saveTask(task);
    setSuggestedTasks(suggestedTasks.filter(t => t.id !== task.id));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col w-full overflow-hidden"
    >
      {/* Header */}
      <header className="p-4 border-b border-gray-800 glass-panel sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-purple-400" />
            Automation Center
          </h1>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 container py-6">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="tasks" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center">
              <GitBranch className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create new task */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Task</CardTitle>
                  <CardDescription>
                    Create a new automation task to be executed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Name</label>
                    <Input
                      placeholder="Enter task name"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Type</label>
                    <select
                      className="w-full p-2 rounded-md border border-gray-700 bg-gray-800"
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as AutomationTask["type"])}
                    >
                      <option value="reminder">Reminder</option>
                      <option value="schedule">Schedule</option>
                      <option value="trigger">Trigger</option>
                      <option value="workflow">Workflow</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Details</label>
                    <Textarea
                      placeholder="Enter task details"
                      value={newTaskDetails}
                      onChange={(e) => setNewTaskDetails(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateTask} 
                    className="w-full"
                    disabled={!newTaskName.trim() || !newTaskDetails.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </CardContent>
              </Card>
              
              {/* AI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis</CardTitle>
                  <CardDescription>
                    Analyze text to find automation opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter text to analyze for potential automation tasks..."
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    rows={5}
                  />
                  
                  <Button 
                    onClick={handleAnalyzeText} 
                    className="w-full"
                    disabled={!analysisText.trim() || isAnalyzing}
                    variant="secondary"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Text"}
                  </Button>
                  
                  {suggestedTasks.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-medium">Suggested Tasks</h4>
                      <div className="space-y-2">
                        {suggestedTasks.map((task) => (
                          <div 
                            key={task.id} 
                            className="p-3 bg-gray-800 rounded-md flex justify-between items-center"
                          >
                            <div>
                              <h5 className="font-medium">{task.name}</h5>
                              <p className="text-xs text-gray-400">{task.details}</p>
                              <Badge variant="outline" className="mt-1">{task.type}</Badge>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleAddSuggestedTask(task)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Separator className="my-6" />
            
            {/* Task List */}
            <AutomationTaskList 
              tasks={tasks}
              onUpdateStatus={updateTaskStatus}
              onDelete={deleteTask}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create new workflow */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Workflow</CardTitle>
                  <CardDescription>
                    Generate an AI-powered automation workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Workflow Name</label>
                    <Input
                      placeholder="Enter workflow name"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe what you want to automate..."
                      value={newWorkflowRequest}
                      onChange={(e) => setNewWorkflowRequest(e.target.value)}
                      rows={5}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateWorkflow} 
                    className="w-full"
                    disabled={!newWorkflowName.trim() || !newWorkflowRequest.trim() || isLoading}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Generate Workflow
                  </Button>
                </CardContent>
              </Card>
              
              {/* Workflow tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Examples</CardTitle>
                  <CardDescription>
                    Sample automation scenarios to inspire you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800 rounded-md">
                      <h5 className="font-medium">Daily Morning Briefing</h5>
                      <p className="text-xs text-gray-400 mt-1">
                        "Create a workflow that sends me a daily summary of my calendar events, important news, and weather forecast every morning at 7am."
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-md">
                      <h5 className="font-medium">Email Organization</h5>
                      <p className="text-xs text-gray-400 mt-1">
                        "When I receive emails with attachments, save the attachments to my cloud storage and create a note with the email summary."
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-md">
                      <h5 className="font-medium">Meeting Follow-ups</h5>
                      <p className="text-xs text-gray-400 mt-1">
                        "After each calendar meeting ends, create a reminder to send follow-up notes and action items within 2 hours."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator className="my-6" />
            
            {/* Workflow List */}
            <AutomationWorkflowList 
              workflows={workflows}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="assistant">
            {/* Automation Assistant */}
            <AutomationAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Automation;
