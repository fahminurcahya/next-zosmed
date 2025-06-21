export type FlowNodeType = 'trigger.comment' | 'action.dm_reply'

export interface FlowNodeData {
    label?: string
    message?: string
}

export interface FlowNode {
    id: string
    type: FlowNodeType
    position: { x: number; y: number }
    data: FlowNodeData
}