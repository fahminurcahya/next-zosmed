
import type { AppNode } from "./app-node.type";
import type { TaskParam, TaskType } from "./task.type";
import type { LucideProps } from "lucide-react";


export type WorkflowTask = {
  label: string;
  icon: React.FC<LucideProps>;
  type: TaskType;
  isEntryPoint?: boolean;
  inputs: TaskParam[];
  outputs?: TaskParam[];
  credits: number;
  dropdownComponent?: React.FC<any>;
  sidebarComponent?: React.FC<any>;
};

export type WorkflowExecutionPlanPhase = {
  phase: number;        // Phase number (1, 2, 3, etc.)
  nodes: AppNode[];     // Nodes to execute in this phase
};

export type WorkflowExecutionPlan = WorkflowExecutionPlanPhase[];
