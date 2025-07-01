import type { AppNode } from "@/types/app-node.type";
import { TaskType } from "@/types/task.type";


const defaultSafetyConfig = {
    enabled: true,
    mode: 'safe' as const,
    customLimits: {
        maxRepliesPerHour: 15,
        maxRepliesPerDay: 100,
        delayBetweenReplies: [8, 20] as [number, number]
    },
    contentRules: {
        enableCommentReply: true,
        enableDMReply: true,
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
            safetyConfig: defaultSafetyConfig,
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
