
import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import {
    DatabaseIcon,
    type LucideProps,
} from "lucide-react";

export const AddPropertyToJsonTask = {
    type: TaskType.ADD_PROPERTY_TO_JSON,
    label: "Add property to JSON",
    icon: (props: LucideProps) => <DatabaseIcon className="stroke-orange-400" {...props} />,
    isEntryPoint: false,
    credits: 1,
    inputs: [
        {
            name: "JSON",
            type: TaskParamType.STRING,
            required: true,
        },
        {
            name: "Property name",
            type: TaskParamType.STRING,
            required: true,
        },
        {
            name: "Property value",
            type: TaskParamType.STRING,
            required: true,
        },
    ] as const,
    outputs: [
        {
            name: "Upadte JSON",
            type: TaskParamType.STRING,
        },
    ] as const,
} satisfies WorkflowTask;
