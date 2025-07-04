
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


export interface IGReplyData {
    publicReplies: string[];
    dmMessage: string;
    buttons: Array<{
        title: string;
        url: string;
        enabled: boolean;
    }>;
    // Updated safety config dengan Combined Actions
    safetyConfig?: {
        enabled: boolean;
        mode: 'safe' | 'balanced' | 'aggressive' | 'custom';

        // Combined Actions - single counter untuk semua action types
        combinedLimits?: {
            maxActionsPerHour: number;      // Total budget per hour
            maxActionsPerDay: number;       // Total budget per day
            delayBetweenActions: [number, number]; // [min, max] in seconds
            commentToDmDelay: [number, number];    // Extra delay comment->DM
        };

        // Control which action types are enabled
        actionTypes?: {
            enableCommentReply: boolean;
            enableDMReply: boolean;
        };

        contentRules?: {
            maxMentions: number;
            maxHashtags: number;
        };

        budgetAllocation?: {
            preferredDmRatio: number;      // 0.0-1.0 (e.g. 0.6 = 60% DM)
            adaptiveBudgeting: boolean;    // Auto-adjust based on performance
        };
    };
}

// Helper type untuk workflow execution
export interface CombinedActionLimits {
    maxActionsPerHour: number;
    maxActionsPerDay: number;
    delayBetweenActions: [number, number];
    commentToDmDelay: [number, number];
    actionTypes: {
        enableCommentReply: boolean;
        enableDMReply: boolean;
    };
}

// Stats type untuk tracking
export interface ActionStats {
    daily: {
        total: number;
        comments: number;
        dms: number;
    };
    hourly: {
        total: number;
        comments: number;
        dms: number;
    };
}

// Execution result type
export interface ExecutionResult {
    success: boolean;
    actionsPerformed: {
        comments: number;
        dms: number;
    };
    errors?: string[];
    budgetUsed: {
        hourly: number;
        daily: number;
    };
}

