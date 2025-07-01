import FormSafetyConfiguration from "@/app/(protected)/workflow/editor/[workflowId]/_components/content/form-safety-config-ig";
import { TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { Shield } from "lucide-react";

export const IGSafetyConfigTask = {
    type: TaskType.IG_SAFETY_CONFIG,
    label: 'Safety Configuration',
    icon: ({ className, ...props }: { className?: string }) => (
        <Shield className={`stroke-blue-400 ${className}`} {...props} />
    ),
    isEntryPoint: false,
    credits: 0,
    inputs: [] as const,
    outputs: [] as const,
    sidebarComponent: FormSafetyConfiguration
} satisfies WorkflowTask;

export default IGSafetyConfigTask;