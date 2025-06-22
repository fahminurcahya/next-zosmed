import type { AppNode } from "@/types/app-node.type";
import { TaskType } from "@/types/task.type";


export function CreateFlowNode(
    nodeType: TaskType,
    position?: { x: number; y: number }
): AppNode {
    const nodeData: any = {
        type: nodeType,
        inputs: {},
    };

    // Initialize specific data for IG_USER_COMMENT nodes
    if (nodeType === TaskType.IG_USER_COMMENT) {
        nodeData.igUserCommentData = {
            selectedPostId: "",
            includeKeywords: [],
            excludeKeywords: [],
        };
    }

    if (nodeType === TaskType.IG_SEND_MSG) {
        nodeData.igReplyData = {
            publicReplies: [],
            dmMessage: "",
            buttons: [],
        };
    }

    // Initialize specific data for IG_USER_COMMENT nodes
    if (nodeType === TaskType.IG_USER_DM) {
        nodeData.igUserDMData = {
            includeKeywords: [],
        };
    }

    if (nodeType === TaskType.IG_SEND_MSG_FROM_DM) {
        nodeData.igReplyData = {
            dmMessage: "",
            buttons: [],
        };
    }
    console.log("create node")

    console.log(nodeData)

    return {
        id: crypto.randomUUID(),
        type: "FlowScrapeNode",
        data: nodeData,
        position: position ?? { x: 0, y: 0 },
    };

}
