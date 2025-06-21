
import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import {
    DatabaseIcon,
    type LucideProps,
} from "lucide-react";

export const IGTrigger = {
    type: TaskType.IG_TRIGGER,
    label: "When ....",
    icon: (props: LucideProps) => <DatabaseIcon className="stroke-orange-400" {...props} />,
    isEntryPoint: true,
    credits: 1,
    inputs: [] as const,
    outputs: [
        {
            name: "Upadte JSON",
            type: TaskParamType.TRIGGER,
        },
    ] as const,
} satisfies WorkflowTask;
