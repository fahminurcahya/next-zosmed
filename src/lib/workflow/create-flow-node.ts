import type { AppNode } from "@/types/app-node.type";
import type { TaskType } from "@/types/task.type";


export function CreateFlowNode(
    nodeType: TaskType,
    position?: { x: number; y: number }
): AppNode {
    return {
        id: crypto.randomUUID(),
        type: "FlowScrapeNode",
        data: {
            type: nodeType,
            inputs: {},
        },
        position: position ?? { x: 0, y: 0 },
    };
}
