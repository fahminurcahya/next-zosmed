import type { AppNode } from "@/types/app-node.type";
import { TaskType } from "@/types/task.type";


const defaultSafetyConfig = {
    enabled: true,
    mode: 'balanced' as const,
    combinedLimits: {
        maxActionsPerHour: 25,
        maxActionsPerDay: 200,
        delayBetweenActions: [5, 15] as [number, number],
        commentToDmDelay: [8, 15] as [number, number]

    },
    actionTypes: {
        enableCommentReply: true,
        enableDMReply: true,
    },
    contentRules: {
        maxMentions: 1,
        maxHashtags: 2
    }
};



export function CreateFlowNode(
    nodeType: TaskType,
    position?: { x: number; y: number }
): AppNode {
    const nodeData: any = {
        type: nodeType,
        inputs: {},
    };

    // Initialize specific data for IG_COMMENT_RECEIVED nodes
    if (nodeType === TaskType.IG_COMMENT_RECEIVED) {
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
            safetyConfig: defaultSafetyConfig,
        };
    }

    // Initialize specific data for IG_COMMENT_RECEIVED nodes
    if (nodeType === TaskType.IG_USER_DM) {
        nodeData.igUserDMData = {
            includeKeywords: [],
        };
    }

    if (nodeType === TaskType.IG_SEND_MSG_FROM_DM) {
        nodeData.igReplyData = {
            dmMessage: "",
            buttons: [],
            safetyConfig: defaultSafetyConfig,
        };
    }
    console.log("create node with safety defaults", nodeData);

    return {
        id: crypto.randomUUID(),
        type: "FlowScrapeNode",
        data: nodeData,
        position: position ?? { x: 0, y: 0 },
    };

}
