
import type { Node } from "@xyflow/react";
import type { TaskParam, TaskType } from "./task.type";

export interface AppNodeData {
    type: TaskType;
    inputs: Record<string, string>;
    [key: string]: any;
}

export interface AppNode extends Node {
    data: AppNodeData;
}

export interface ParamProps {
    param: TaskParam;
    value: string;
    updateNodeParamValue: (newValue: string) => void;
    disabled?: boolean;
}

export type AppNodeMissingInputs = {
    nodeId: string;
    inputs: string[];
};


///////////////
export type EditorNodeType = {
    id: string
    type: EditorCanvasCardType['type']
    position: {
        x: number
        y: number
    }
    data: EditorCanvasCardType
}

export type EditorCanvasCardType = {
    title: string
    description: string
    completed: boolean
    current: boolean
    metadata: any
    type: EditorCanvasTypes
}

export type EditorCanvasTypes =
    | 'Email'
    | 'Condition'
    | 'AI'
    | 'Slack'
    | 'Google Drive'
    | 'Notion'
    | 'Custom Webhook'
    | 'Google Calendar'
    | 'Trigger'
    | 'Action'
    | 'Wait'

export type EditorNode = EditorNodeType

export type EditorActions =
    | {
        type: 'LOAD_DATA'
        payload: {
            elements: EditorNode[]
            edges: {
                id: string
                source: string
                target: string
            }[]
        }
    }
    | {
        type: 'UPDATE_NODE'
        payload: {
            elements: EditorNode[]
        }
    }
    | { type: 'REDO' }
    | { type: 'UNDO' }
    | {
        type: 'SELECTED_ELEMENT'
        payload: {
            element: EditorNode
        }
    }

export const nodeMapper: Record<string, string> = {
    Notion: 'notionNode',
    Slack: 'slackNode',
    Discord: 'discordNode',
    'Google Drive': 'googleNode',
}

export interface SafetySettings {
    enabled: boolean;
    useRecommendedLimits?: boolean;
    customLimits?: {
        commentsPerHour?: number;
        commentsPerDay?: number;
        dmsPerHour?: number;
        dmsPerDay?: number;
    };
    delays?: {
        enabled: boolean;
        minDelay?: number;
        maxDelay?: number;
        betweenCommentAndDm?: number;
    };
    contentSafety?: {
        enabled: boolean;
        checkBannedPhrases?: boolean;
        maxMentions?: number;
        maxHashtags?: number;
        maxUrls?: number;
    };
    activeHours?: {
        enabled: boolean;
        startHour?: number;
        endHour?: number;
        timezone?: string;
    };
    warmupMode?: {
        enabled: boolean;
        days?: number;
        actionsPerDay?: number;
    };
}

export interface IGUserCommentData {
    selectedPostId?: string;
    includeKeywords: string[];
    excludeKeywords: string[];
}

export interface IGUserDMData {
    includeKeywords: string[];
}

export interface IGReplyData {
    publicReplies: string[];
    dmMessage: string;
    buttons: Array<{
        title: string;
        url: string;
        enabled: boolean;
    }>;
    // NEW: Optional safety config (backward compatible)
    safetyConfig?: {
        enabled: boolean;
        mode: 'safe' | 'balanced' | 'aggressive' | 'custom';
        customLimits?: {
            maxRepliesPerHour: number;
            maxRepliesPerDay: number;
            delayBetweenReplies: [number, number];
        };
        contentRules: {
            enableCommentReply: boolean;
            enableDMReply: boolean;
            maxMentions: number;
            maxHashtags: number;
        };
    };
}

