"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateFlowNode } from "@/lib/workflow/create-flow-node";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import type { AppNode } from "@/types/app-node.type";
import type { TaskType } from "@/types/task.type";

import { useReactFlow } from "@xyflow/react";
import { CoinsIcon, CopyIcon, GripVerticalIcon, Move, TrashIcon } from "lucide-react";
import React from "react";

function NodeHeader({
    taskType,
    nodeId,
}: {
    taskType: TaskType;
    nodeId: string;
}) {
    const task = TaskRegistry[taskType];
    const { deleteElements, getNode, addNodes } = useReactFlow();
    return (
        <div className="flex items-center gap-2 p-2">
            {task?.icon && <task.icon size={16} />}
            <div className="flex justify-between items-center w-full">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                    {task.isEntryPoint && "WHEN "}
                    {task?.label}
                </p>
                <div className="flex gap-1 items-center">
                    {task.isEntryPoint && <Badge>Entry point</Badge>}

                    {!task.isEntryPoint && (
                        <>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => {
                                    deleteElements({
                                        nodes: [{ id: nodeId }],
                                    });
                                }}
                            >
                                <TrashIcon size={12} />
                            </Button>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => {
                                    const node = getNode(nodeId) as AppNode;
                                    const newX = node.position.x;
                                    const newY = node.position.y + node.measured?.height! + 20;
                                    const newNode = CreateFlowNode(node.data.type, {
                                        x: newX,
                                        y: newY,
                                    });
                                    addNodes([newNode]);
                                }}
                            >
                                <CopyIcon size={12} />
                            </Button>
                        </>
                    )}
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        className="drag-handle cursor-grab"
                    >
                        <Move size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default NodeHeader;
