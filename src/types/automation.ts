
export type AutomationTaskType = "reminder" | "schedule" | "trigger" | "workflow";
export type AutomationTaskStatus = "pending" | "active" | "completed" | "failed";

export interface AutomationTask {
  id: string;
  name: string;
  type: AutomationTaskType;
  details: string;
  status: AutomationTaskStatus;
  createdAt: Date;
  completedAt?: Date;
  schedule?: string;
  triggerCondition?: string;
  actions?: AutomationAction[];
}

export interface AutomationAction {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AutomationTrigger {
  id: string;
  type: string;
  condition: string;
  parameters: Record<string, any>;
}
