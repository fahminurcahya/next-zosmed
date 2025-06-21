"use client";

import { cn } from "@/lib/utils";
import { TaskParamType, type TaskParam } from "@/types/task.type";
import { Handle, Position, useReactFlow, type Node } from "@xyflow/react";
import type { ReactNode } from "react";
import PopoverNode from "./trigger/popover-node";
import { ColorForHandle } from "./common";

export function NodeOutputs({ children }: { children: ReactNode }) {
    return <div className="flex flex-col divide-y gap-1">{children}</div>;
}

export function NodeOutput({ output, children, nodeId }: {
    output: TaskParam, children: ReactNode, nodeId: string
}) {
    const { getEdges } = useReactFlow();
    const edges = getEdges();

    const isConnected = edges.some(
        (edge) =>
            edge.source === nodeId
    );

    switch (output.type) {
        case TaskParamType.TRIGGER:
            return (
                <>
                    {!isConnected ?
                        <PopoverNode>{children}</PopoverNode> :
                        <Handle
                            type="source"
                            position={Position.Bottom}
                            className={cn(
                                "!bg-muted-foreground !border-2 !border-background !-bottom-2 !w-4 !h-4",
                            )}
                        />
                    }

                </>
            );
        default:
            return (
                <div className="flex justify-end relative p-3 bg-secondary">
                    <p className="text-xs text-muted-foreground">{output.name}</p>
                    <Handle
                        type="source"
                        position={Position.Right}
                        className={cn(
                            "!bg-muted-foreground !border-2 !border-background !-right-2 !w-4 !h-4",
                            ColorForHandle[output.type]
                        )}
                    />
                </div>
            );
    }
}
