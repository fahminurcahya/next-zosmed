// components/nodes/SetupDMNode.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Handle, Position } from '@xyflow/react'

export default function SetupDMNode({ data }: any) {
    return (
        <div className="bg-white rounded-xl shadow-md p-4 w-64">
            <h4 className="text-md font-semibold mb-2">Setup DM Keyword</h4>
            <Input
                placeholder="Enter keyword..."
                value={data.keyword}
                onChange={(e) => data.onChangeKeyword(e.target.value)}
            />
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    )
}
