"use client";


import type { AppNode } from "@/types/app-node.type";
import { TaskParamType, type TaskParam } from "@/types/task.type";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import SelectParam from "./param/select-param";
import StringParam from "./param/string-param";
import BrowserInstanceParam from "./param/browser-intance-param";

function NodeParamField({
    param,
    nodeId,
    disabled,
}: {
    param: TaskParam;
    nodeId: string;
    disabled: boolean;
}) {
    const { updateNodeData, getNode } = useReactFlow();
    const node = getNode(nodeId) as AppNode;
    const value = node?.data.inputs?.[param.name];

    const updateNodeParamValue = useCallback(
        (newValue: string) => {
            updateNodeData(nodeId, {
                inputs: {
                    ...node?.data.inputs,
                    [param.name]: newValue,
                },
            });
        },
        [nodeId, updateNodeData, param.name, node?.data.inputs]
    );

    switch (param.type) {
        case TaskParamType.STRING:
            return (
                <StringParam
                    param={param}
                    value={value!}
                    updateNodeParamValue={updateNodeParamValue}
                    disabled={disabled}
                />
            );
        case TaskParamType.BROWSER_INSTANCE:
            return (
                <BrowserInstanceParam
                    param={param}
                    value={""}
                    updateNodeParamValue={updateNodeParamValue}
                />
            );
        case TaskParamType.SELECT:
            return (
                <SelectParam
                    param={param}
                    value={value!}
                    updateNodeParamValue={updateNodeParamValue}
                    disabled={disabled}
                />
            );

        // case TaskParamType.CREDENTIAL:
        //     return (
        //         <CredentialsParam
        //             param={param}
        //             value={value}
        //             updateNodeParamValue={updateNodeParamValue}
        //             disabled={disabled}
        //         />
        //     );
        default:
            return (
                <div className="w-full">
                    <p className="text-xs text-muted-foreground">Not implemented</p>
                </div>
            );
    }
}

export default NodeParamField;
