
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

