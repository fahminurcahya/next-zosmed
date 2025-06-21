import useFlowValidation from "@/components/hooks/use-flow-validation";
import { cn } from "@/lib/utils";
import type { TaskParam } from "@/types/task.type";
import { Handle, Position, useEdges } from "@xyflow/react";
import type { ReactNode } from "react";
import NodeParamField from "./node-param-field";
import { ColorForHandle } from "./common";

export function NodeInputs({ children }: { children: ReactNode }) {
    return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({
    nodeId,
}: {
    nodeId: string;
}) {
    // const { invalidInputs } = useFlowValidation();
    const edges = useEdges();
    const isConnected = edges.some(
        (edge) => edge.target === nodeId
    );
    // const hasErrors = invalidInputs
    //     .find((node) => node.nodeId === nodeId)
    //     ?.inputs.find((invalidInput) => invalidInput === input.name);

    return (
        <>
            <Handle
                isConnectable={!isConnected}
                type="target"
                position={Position.Top}
                className={cn(
                    "!bg-muted-foreground !border-2 !border-background !-top-2 !w-4 !h-4",
                )}
            />
        </>


    );
}
