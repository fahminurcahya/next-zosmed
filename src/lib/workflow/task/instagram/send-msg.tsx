import FormReplyIG from "@/app/(protected)/workflow/editor/[workflowId]/_components/content/form-reply-ig";
import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { Send, Zap, type LucideProps } from "lucide-react";
import { Form } from "react-hook-form";

export const IGSendMessage = {
    type: TaskType.IG_SEND_MSG,
    label: "Send the user message",
    icon: (props: LucideProps) => (
        <Send className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 1,
    inputs: [
        // {
        //     name: "Action",
        //     type: TaskParamType.TRIGGER,
        //     required: true,
        // },
    ] as const,
    outputs: [
    ] as const,
    sidebarComponent: () => (
        <FormReplyIG />
    )

} satisfies WorkflowTask;
