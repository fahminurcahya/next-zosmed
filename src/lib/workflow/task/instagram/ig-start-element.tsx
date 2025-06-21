
import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import {
    DatabaseIcon,
    type LucideProps,
} from "lucide-react";

export const IGStarElement = {
    type: TaskType.IG_START_ELEMENT,
    label: "When ....",
    icon: (props: LucideProps) => <DatabaseIcon className="stroke-orange-400" {...props} />,
    isEntryPoint: false,
    credits: 1,
    inputs: [] as const,
    outputs: [
        {
            name: "Upadte JSON",
            type: TaskParamType.STRING,
        },
    ] as const,
} satisfies WorkflowTask;
