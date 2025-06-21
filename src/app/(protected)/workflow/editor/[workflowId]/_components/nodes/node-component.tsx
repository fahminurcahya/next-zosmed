import { Badge } from "@/components/ui/badge";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import type { AppNodeData } from "@/types/app-node.type";
import type { NodeProps } from "@xyflow/react";
import { memo } from "react";
import NodeCard from "./node-card";
import NodeHeader from "./node-header";
import { NodeInput, NodeInputs } from "./node-inputs";
import { NodeOutput, NodeOutputs } from "./node-outputs";
import { TaskType } from "@/types/task.type";
import TriggerNode from "./trigger-node";

// Remove the extended props interface since we're not using it anymore
// interface ExtendedNodeProps extends NodeProps {
//     onCreateAndConnect?: (sourceNodeId: string, sourceHandle: string, taskType: TaskType) => void;
// }

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

const NodeComponent = memo((props: NodeProps) => {
    const nodeData = props.data as AppNodeData & { onCreateAndConnect?: (sourceNodeId: string, sourceHandle: string, taskType: TaskType) => void };
    const task = TaskRegistry[nodeData.type];
    const DropdownComponent = task.dropdownComponent;

    return (
        <NodeInputs>
            {!task.isEntryPoint &&
                <NodeInput key={props.id} nodeId={props.id} />
            }
            <NodeCard nodeId={props.id} isSelected={!!props.selected}>
                {DEV_MODE && <Badge>DEV: {props.id}</Badge>}
                <NodeHeader taskType={nodeData.type} nodeId={props.id} />
                {nodeData.type == TaskType.IG_TRIGGER && <TriggerNode />}


                {Array.isArray(task.outputs) && task.outputs.map((output) => (
                    <NodeOutput key={output.name} output={output} nodeId={props.id}>
                        {DropdownComponent && (
                            <DropdownComponent
                                sourceNodeId={props.id}
                                sourceHandle={output.name}
                                onCreateAndConnect={nodeData.onCreateAndConnect}
                            />
                        )}
                    </NodeOutput>
                ))}
            </NodeCard>
        </NodeInputs>


    );
});

NodeComponent.displayName = "NodeComponent";
export default NodeComponent;