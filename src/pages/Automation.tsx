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
import { Plus, ArrowRight, BrainCircuit, List, GitBranch, Zap, Camera, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AutomationTaskList from "@/components/AutomationTaskList";
import AutomationWorkflowList from "@/components/AutomationWorkflowList";
import AutomationAssistant from "@/components/AutomationAssistant";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import SubscriptionPlans from "@/components/SubscriptionPlans";

const Automation = () => {
  const {
    tasks,
    workflows,
    isLoading,
    isAnalyzing,
    saveTask,
    saveWorkflow,
    updateTaskStatus,
    deleteTask,
    analyzeText,
    createWorkflowFromRequest,
    updateWorkflowStatus
  } = useAutomation();
  
  const { user, hasValidSubscription } = useAuth();
  const navigate = useNavigate();
  
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskType, setNewTaskType] = useState<AutomationTask["type"]>("reminder");
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowRequest, setNewWorkflowRequest] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [suggestedTasks, setSuggestedTasks] = useState<AutomationTask[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
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
    
    setNewTaskName("");
    setNewTaskType("reminder");
    setNewTaskDetails("");
  };
  
  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim() || !newWorkflowRequest.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (user?.subscriptionTier === 'free' && workflows.length >= 5) {
      setShowSubscriptionModal(true);
      return;
    }
    
    await createWorkflowFromRequest(newWorkflowRequest, newWorkflowName);
    
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
    if (user?.subscriptionTier === 'free' && tasks.length >= 5) {
      setShowSubscriptionModal(true);
      return;
    }
    
    await saveTask(task);
    setSuggestedTasks(suggestedTasks.filter(t => t.id !== task.id));
  };
  
  const handleToggleWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    await updateWorkflowStatus(workflowId, isActive);
  };
  
  const checkFeatureAccess = (feature: string): boolean => {
    switch (feature) {
      case 'computer-vision':
        return user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise' || user?.role === 'admin' || user?.role === 'owner';
      case 'workflow-creation':
        return true; // All can create at least some workflows
      default:
        return true;
    }
  };
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col w-full overflow-hidden"
    >
      <header className="p-4 border-b border-gray-800 glass-panel sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleGoBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
            <h1 className="text-xl font-bold text-white flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2 text-purple-400" />
              Automation Center
            </h1>
          </div>
          {!hasValidSubscription && (
            <Button 
              size="sm" 
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </header>
      
      <div className="flex-1 container py-6">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
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
            <TabsTrigger value="vision" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Computer Vision
              {!checkFeatureAccess('computer-vision') && (
                <Lock className="h-3 w-3 ml-1 text-gray-500" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <AutomationTaskList 
              tasks={tasks}
              onUpdateStatus={updateTaskStatus}
              onDelete={deleteTask}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <AutomationWorkflowList 
              workflows={workflows}
              isLoading={isLoading}
              onToggleActive={handleToggleWorkflowStatus}
            />
          </TabsContent>
          
          <TabsContent value="assistant">
            <AutomationAssistant />
          </TabsContent>
          
          <TabsContent value="vision">
            {checkFeatureAccess('computer-vision') ? (
              <Card>
                <CardHeader>
                  <CardTitle>Computer Vision</CardTitle>
                  <CardDescription>
                    Use computer vision to automate image and video processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Image Recognition</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                            <Camera className="h-10 w-10 text-gray-500 mb-4" />
                            <p className="text-sm text-gray-400">Drag and drop an image or click to upload</p>
                            <Button className="mt-4" variant="outline">
                              Upload Image
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Video Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                            <Zap className="h-10 w-10 text-gray-500 mb-4" />
                            <p className="text-sm text-gray-400">Connect to a video source or upload a video file</p>
                            <Button className="mt-4" variant="outline">
                              Connect Video
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Vision Automation Workflows</CardTitle>
                          <CardDescription>Create automation workflows based on visual triggers</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-800 rounded-lg">
                              <h3 className="font-medium">Object Detection Trigger</h3>
                              <p className="text-sm text-gray-400 mt-1">
                                Trigger an automation when a specific object is detected in a video feed
                              </p>
                              <Button size="sm" variant="outline" className="mt-3">
                                Configure
                              </Button>
                            </div>
                            
                            <div className="p-4 bg-gray-800 rounded-lg">
                              <h3 className="font-medium">Document Processing</h3>
                              <p className="text-sm text-gray-400 mt-1">
                                Automatically extract and process information from scanned documents
                              </p>
                              <Button size="sm" variant="outline" className="mt-3">
                                Configure
                              </Button>
                            </div>
                            
                            <div className="p-4 bg-gray-800 rounded-lg">
                              <h3 className="font-medium">Custom Vision Model</h3>
                              <p className="text-sm text-gray-400 mt-1">
                                Train a custom vision model for your specific automation needs
                              </p>
                              <Button size="sm" variant="outline" className="mt-3">
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <Lock className="h-16 w-16 text-gray-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  Computer Vision features are available on Premium and Enterprise plans. 
                  Upgrade your subscription to access these advanced capabilities.
                </p>
                <Button 
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Upgrade Plan
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSubscriptionModal(false)}>
                  ×
                </Button>
              </div>
              
              <SubscriptionPlans 
                onSelectPlan={(plan) => {
                  toast.info(`Subscription to ${plan.name} coming soon!`);
                  setShowSubscriptionModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </motion.div>
  );
};

export default Automation;
