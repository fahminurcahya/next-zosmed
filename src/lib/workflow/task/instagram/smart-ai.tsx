import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { Bot, Send, Sparkles, Zap, type LucideProps } from "lucide-react";

export const IGSendWithAI = {
    type: TaskType.IG_SEND_WITH_AI,
    label: "Lets Smart AI take over",
    icon: (props: LucideProps) => (
        <Sparkles className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 1,
    inputs: [

    ] as const,
    outputs: [
    ] as const

} satisfies WorkflowTask;
