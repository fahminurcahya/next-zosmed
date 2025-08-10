import type { WorkflowTask } from "@/types/workflow.type";
import type { TaskType } from "@/types/task.type";
import { IGTrigger } from "./instagram/trigger-element";
import { IGUserComment } from "./instagram/user-comment";
import { IGUserDM } from "./instagram/user-dm";
import { IGSendMessage } from "./instagram/send-msg";
import { IGSendWithAI } from "./instagram/smart-ai";
import { IGSendMessageFromDM } from "./instagram/send-msg-dm";
import IGSafetyConfigTask from "./instagram/safety-config";

type Registry = {
    [K in TaskType]: WorkflowTask & { type: K };
};
// todo 
export const TaskRegistry: Registry = {
    IG_TRIGGER: IGTrigger,
    IG_COMMENT_RECEIVED: IGUserComment,
    IG_USER_DM: IGUserDM,
    IG_SEND_MSG: IGSendMessage,
    IG_SEND_WITH_AI: IGSendWithAI,
    IG_SEND_MSG_FROM_DM: IGSendMessageFromDM,
};
