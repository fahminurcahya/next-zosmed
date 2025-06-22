import type { WorkflowTask } from "@/types/workflow.type";
import { AddPropertyToJsonTask } from "./add-property-to-json";
import { ClickElementTask } from "./click-element";
import type { TaskType } from "@/types/task.type";
import { IGStarElement } from "./instagram/ig-start-element";
import { LaunchBrowserTask } from "./launch-browser";
import { PageToHtmlTask } from "./page-to-html";
import { ExtractTextFromElementTask } from "./extract-text-from-element";
import { FillInputTask } from "./fill-input";
import { WaitForElementTask } from "./wait-for-element";
import { DeliverViaWebhookTask } from "./deliver-via-webhook";
import { ExtractDataWithAITask } from "./extract-data-with-ai";
import { ReadPropertyFromJsonTask } from "./read-property-from-json";
import { NavigateUrlTask } from "./navigate-url-task";
import { ScrollToElementTask } from "./scroll-to-element";
import { IGTrigger } from "./instagram/trigger-element";
import { IGUserComment } from "./instagram/user-comment";
import { IGUserDM } from "./instagram/user-dm";
import { IGSendMessage } from "./instagram/send-msg";
import { IGSendWithAI } from "./instagram/smart-ai";
import { IGSendMessageFromDM } from "./instagram/send-msg-dm";

type Registry = {
    [K in TaskType]: WorkflowTask & { type: K };
};
// todo 
export const TaskRegistry: Registry = {
    CLICK_ELEMENT: ClickElementTask,
    ADD_PROPERTY_TO_JSON: AddPropertyToJsonTask,
    LAUNCH_BROWSER: LaunchBrowserTask,
    PAGE_TO_HTML: PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementTask,
    FILL_INPUT: FillInputTask,
    WAIT_FOR_ELEMENT: WaitForElementTask,
    DELIVER_VIA_WEBHOOK: DeliverViaWebhookTask,
    EXTRACT_DATA_WITH_AI: ExtractDataWithAITask,
    READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonTask,
    NAVIGATE_URL: NavigateUrlTask,
    SCROLL_TO_ELEMENT: ScrollToElementTask,
    IG_TRIGGER: IGTrigger,
    IG_USER_COMMENT: IGUserComment,
    IG_USER_DM: IGUserDM,
    IG_SEND_MSG: IGSendMessage,
    IG_SEND_WITH_AI: IGSendWithAI,
    IG_SEND_MSG_FROM_DM: IGSendMessageFromDM
};
