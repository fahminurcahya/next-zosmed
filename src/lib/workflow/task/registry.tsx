import type { WorkflowTask } from "@/types/workflow.type";
import { AddPropertyToJsonTask } from "./add-property-to-json";
import { ClickElementTask } from "./click-element";
import type { TaskType } from "@/types/task.type";

type Registry = {
    [K in TaskType]: WorkflowTask & { type: K };
};
// todo 
export const TaskRegistry: Registry = {
    CLICK_ELEMENT: ClickElementTask,
    ADD_PROPERTY_TO_JSON: AddPropertyToJsonTask,
    LAUNCH_BROWSER: {} as WorkflowTask & { type: TaskType.LAUNCH_BROWSER },
    PAGE_TO_HTML: {} as WorkflowTask & { type: TaskType.PAGE_TO_HTML },
    EXTRACT_TEXT_FROM_ELEMENT: {} as WorkflowTask & { type: TaskType.EXTRACT_TEXT_FROM_ELEMENT },
    FILL_INPUT: {} as WorkflowTask & { type: TaskType.FILL_INPUT },
    WAIT_FOR_ELEMENT: {} as WorkflowTask & { type: TaskType.WAIT_FOR_ELEMENT },
    DELIVER_VIA_WEBHOOK: {} as WorkflowTask & { type: TaskType.DELIVER_VIA_WEBHOOK },
    EXTRACT_DATA_WITH_AI: {} as WorkflowTask & { type: TaskType.EXTRACT_DATA_WITH_AI },
    READ_PROPERTY_FROM_JSON: {} as WorkflowTask & { type: TaskType.READ_PROPERTY_FROM_JSON },
    NAVIGATE_URL: {} as WorkflowTask & { type: TaskType.NAVIGATE_URL },
    SCROLL_TO_ELEMENT: {} as WorkflowTask & { type: TaskType.SCROLL_TO_ELEMENT },
};
