import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import {
    MousePointerClick,
    SendIcon,
    TextIcon,
    type LucideProps,
} from "lucide-react";

export const DeliverViaWebhookTask = {
    type: TaskType.DELIVER_VIA_WEBHOOK,
    label: "Deliver via Webhook",
    icon: (props: LucideProps) => <SendIcon className="stroke-blue-400" {...props} />,
    isEntryPoint: false,
    credits: 1,
    inputs: [
        {
            name: "Target URL",
            type: TaskParamType.STRING,
            required: true,
        },
        {
            name: "Body",
            type: TaskParamType.STRING,
            required: true,
        },
    ] as const,
    outputs: [] as const,
} satisfies WorkflowTask;
