import { WorkflowTriggerType } from "@prisma/client";
import { z } from "zod";

export const createWorkflowSchema = z.object({
  integrationId: z.string().min(1, "Please select an Instagram account"),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  triggerType: z.nativeEnum(WorkflowTriggerType),
  definition: z.any().default(""),
  isActive: z.boolean().default(false).optional(),
});

export type createWorkflowSchemaType = z.infer<typeof createWorkflowSchema>;

export const duplicateWorkflowSchema = createWorkflowSchema.extend({
  workflowId: z.string(),
});

export type duplicateWorkflowSchemaType = z.infer<
  typeof duplicateWorkflowSchema
>;

export const createAutomationSchema = z.object({
  name: z.string().min(1).max(50),
});

export type createAutomationSchemaType = z.infer<typeof createAutomationSchema>;


export const addTriggerSchema = z.object({
  id: z.string(),
  trigger: z.array(z.string())
});

export type addTriggerSchemaType = z.infer<typeof addTriggerSchema>;


export const updateWorkflowSchema = z.object({
  id: z.string(), definition: z.string()
});

export type updateWorkflowSchemaType = z.infer<typeof updateWorkflowSchema>;