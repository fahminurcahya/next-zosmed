
import type { TaskParam, TaskType } from "./task.type";
import type { AppNode } from "./app-node.type";
import type { LucideProps } from "lucide-react";
import type { ReactNode } from "react";
import type { Edge, Node } from "@xyflow/react";

export enum WorkflowStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}
export type WorkflowTask = {
  label: string;
  icon: React.FC<LucideProps>;
  type: TaskType;
  isEntryPoint?: boolean;
  inputs: TaskParam[];
  outputs: TaskParam[];
  credits: number;
  dropdownComponent?: React.FC<any>;
  sidebarComponent?: React.FC<any>;
};

export type WorkflowExecutionPlanPhase = {
  phase: number;
  nodes: AppNode[];
};

export type WorkflowExecutionPlan = WorkflowExecutionPlanPhase[];

export enum WorkflowExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum WorkflowExecutionTrigger {
  MANUAL = "MANUAL",
  CRON = "CRON",
}

export enum ExecutionPhaseStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type Registry = {
  // todo
  [K in TaskType.CLICK_ELEMENT | TaskType.ADD_PROPERTY_TO_JSON]: WorkflowTask & { type: K };
};

export interface WorkflowDefinition {
  nodes: AppNode[];
  edges: Edge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}
