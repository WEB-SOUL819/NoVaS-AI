
import React from "react";
import { AutomationTask } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Play, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AutomationTaskListProps {
  tasks: AutomationTask[];
  onUpdateStatus: (taskId: string, status: AutomationTask['status']) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  isLoading: boolean;
}

const AutomationTaskList: React.FC<AutomationTaskListProps> = ({
  tasks,
  onUpdateStatus,
  onDelete,
  isLoading
}) => {
  const getStatusIcon = (status: AutomationTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'active':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const getStatusColor = (status: AutomationTask['status']) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'active':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'completed':
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'failed':
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };
  
  const getTypeColor = (type: AutomationTask['type']) => {
    switch (type) {
      case 'reminder':
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case 'schedule':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'trigger':
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case 'workflow':
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading tasks...</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            You don't have any automation tasks yet. Create one to get started.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Automation Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border border-gray-700 rounded-lg bg-gray-800/50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{task.name}</h3>
                    <Badge className={getStatusColor(task.status)}>
                      <span className="flex items-center">
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status}</span>
                      </span>
                    </Badge>
                  </div>
                  
                  <Badge className={`mb-2 ${getTypeColor(task.type)}`}>
                    {task.type}
                  </Badge>
                  
                  <p className="text-sm text-gray-400 mt-1">{task.details}</p>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {task.createdAt.toLocaleString()}
                    {task.completedAt && (
                      <span className="ml-2">
                        Completed: {task.completedAt.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {task.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(task.id, 'active')}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(task.id, 'completed')}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    </>
                  )}
                  
                  {task.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(task.id, 'completed')}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(task.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationTaskList;
