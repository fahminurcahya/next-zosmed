'use client'

import { Card } from "@/components/ui/card"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import NodeCard from "./node-card"
import { Badge } from "lucide-react"
import NodeHeader from "./node-header"
import type { AppNodeData } from "@/types/app-node.type"
import { memo } from "react"


const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
const TriggerCommentNode = memo((props: NodeProps) => {
    const nodeData = props.data as AppNodeData;

    return (
        // <div
        //     className="bg-white border rounded-md shadow-md px-4 py-2 text-sm"
        //     style={{ pointerEvents: 'none' }} // Disable outer click block
        // >
        //     <div style={{ pointerEvents: 'auto' }}>
        //         <strong>{data.label}</strong>
        //     </div>
        //     <Handle type="source" position={Position.Right} />
        // </div>
        <NodeCard nodeId={props.id} isSelected={!!props.selected}>
            {DEV_MODE && <Badge>DEV: {props.id}</Badge>}
            <NodeHeader taskType={nodeData.type} nodeId={props.id} />
            <Card className="p-4 w-72 shadow-md">
                <Handle type="target" position={Position.Top} />
                <div className="font-bold text-lg mb-2">Trigger: IG Comment</div>
                <p className="text-sm text-gray-500">When someone comments on your post or reel</p>
                <Handle type="source" position={Position.Bottom} />
            </Card>
        </NodeCard>


    )
});

export default TriggerCommentNode
