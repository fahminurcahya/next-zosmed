// components/nodes/TriggerNode.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Handle, Position } from '@xyflow/react'
import { useFlowStore } from '../store/flow-store';

export default function TriggerNode({ data }: any) {

    return (
        <div className="bg-white rounded-xl shadow-md p-4 w-60">
            <h4 className="text-md font-semibold mb-2">Trigger</h4>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">Select Trigger</Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                    <ul className="space-y-2">
                        <li>
                            <Button variant="ghost" onClick={() => data.onTriggerSelect('dm')}>
                                DM with Keyword
                            </Button>
                        </li>
                        <li>
                            <Button variant="ghost" onClick={() => data.onTriggerSelect('comment')}>
                                Instagram Comment
                            </Button>
                        </li>
                    </ul>
                </PopoverContent>
            </Popover>

            <Handle type="source" position={Position.Right} />
        </div>
    )
}
