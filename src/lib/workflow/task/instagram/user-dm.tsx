import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { Zap, type LucideProps } from "lucide-react";
import { TaskMenuBtn } from "@/app/(protected)/workflow/editor/[workflowId]/_components/task-menu-btn";
import FormUserDMIG from "@/app/(protected)/workflow/editor/[workflowId]/_components/content/form-user-dm-ig";

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
        {
            name: "Action",
            type: TaskParamType.TRIGGER,
            required: true,
        }
    ] as const,
    dropdownComponent: ({ sourceNodeId, onCreateAndConnect }) => (
        <div className="flex flex-col gap-2">
            <TaskMenuBtn
                taskType={TaskType.IG_SEND_MSG_FROM_DM}
                sourceNodeId={sourceNodeId}
                sourceHandle="Action"
                onCreateAndConnect={onCreateAndConnect}
            />
            <TaskMenuBtn
                taskType={TaskType.IG_SEND_WITH_AI}
                sourceNodeId={sourceNodeId}
                sourceHandle="Action"
                onCreateAndConnect={onCreateAndConnect}
                isDisable
            />
        </div>
    ),
    sidebarComponent: FormUserDMIG, // Remove the arrow function wrapper

} satisfies WorkflowTask;
