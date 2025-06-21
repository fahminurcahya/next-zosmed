import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { MousePointerClick, Zap, type LucideProps } from "lucide-react";
import { TaskMenuBtn } from "@/app/(protected)/workflow/editor/[workflowId]/_components/task-menu-btn";

export const IGUserDM = {
    type: TaskType.IG_USER_DM,
    label: "User sends me a DM",
    icon: (props: LucideProps) => (
        <Zap className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: true,
    credits: 1,
    inputs: [],
    outputs: [

    ] as const,
    dropdownComponent: () => (
        <div className="flex flex-col gap-2">
            <TaskMenuBtn taskType={TaskType.IG_SEND_MSG} />
            <TaskMenuBtn taskType={TaskType.IG_SEND_WITH_AI} />
        </div>
    )

} satisfies WorkflowTask;
