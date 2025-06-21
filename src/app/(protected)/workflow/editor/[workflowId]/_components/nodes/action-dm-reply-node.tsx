'use client'

import { Handle, Position } from "@xyflow/react"


export default function ActionDMReplyNode({ data }: any) {
    return (
        <div className="bg-white rounded-xl shadow-md p-4 border w-64">
            <h4 className="font-semibold mb-1">Instagram</h4>
            <p className="text-sm">Reply in DM:</p>
            <p className="text-xs italic mt-1">{data.message}</p>
            <Handle type="target" position={Position.Left} />
        </div>
    )
}