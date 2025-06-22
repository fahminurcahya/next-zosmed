import FormReplyDMIG from "@/app/(protected)/workflow/editor/[workflowId]/_components/content/form-reply-dm-ig";
import { TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { Send, type LucideProps } from "lucide-react";

export const IGSendMessageFromDM = {
    type: TaskType.IG_SEND_MSG_FROM_DM,
    label: "Send the user message",
    icon: (props: LucideProps) => (
        <Send className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 1,
    inputs: [

    ] as const,
    outputs: [
    ] as const,
    sidebarComponent: FormReplyDMIG

} satisfies WorkflowTask;
