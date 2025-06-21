import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { Zap, type LucideProps } from "lucide-react";
import type { Node } from "@xyflow/react";
import TaskMenu from "@/app/(protected)/workflow/editor/[workflowId]/_components/task-menu";
import { TaskMenuBtn } from "@/app/(protected)/workflow/editor/[workflowId]/_components/task-menu-btn";
import FormUserCommentIG from "@/app/(protected)/workflow/editor/[workflowId]/_components/content/form-user-comment-ig";

export const IGUserComment = {
    type: TaskType.IG_USER_COMMENT,
    label: "User comment in my post",
    icon: (props: LucideProps) => (
        <Zap className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: true,
    credits: 1,
    inputs: [

    ] as const,
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
                taskType={TaskType.IG_SEND_MSG}
                sourceNodeId={sourceNodeId}
                sourceHandle="Action"
                onCreateAndConnect={onCreateAndConnect}
            />
            <TaskMenuBtn
                taskType={TaskType.IG_SEND_WITH_AI}
                sourceNodeId={sourceNodeId}
                sourceHandle="Action"
                onCreateAndConnect={onCreateAndConnect}
            />
        </div>
    ),
    sidebarComponent: () => (
        <FormUserCommentIG />
    ),

} satisfies WorkflowTask;
