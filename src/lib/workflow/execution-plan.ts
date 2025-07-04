import type { AppNode } from "@/types/app-node.type";
import type { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflow.type";

import type { Edge } from "@xyflow/react";

export enum FlowToExecutionPlanValidationError {
    "NO_ENTRY_POINT",
    "INVALID_INPUTS",
}

type FlowToExecutionPlanType = {
    executionPlan?: WorkflowExecutionPlan;
    error?: {
        type: FlowToExecutionPlanValidationError;
        invalidElements?: { nodeId: string; inputs: string[] }[];
    };
};

export function FlowToExecutionPlan(
    nodes: AppNode[],
    edges: Edge[]
): FlowToExecutionPlanType {
    const executionPlan: WorkflowExecutionPlan = [];
    const planned = new Set<string>();
    let phaseNumber = 1;

    // Optional: could detect NO_ENTRY_POINT here if your logic needs it
    if (!nodes || nodes.length === 0) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.NO_ENTRY_POINT,
                invalidElements: [],
            },
        };
    }

    while (planned.size < nodes.length) {
        const currentPhase: WorkflowExecutionPlanPhase = {
            phase: phaseNumber,
            nodes: [],
        };

        for (const node of nodes) {
            if (planned.has(node.id)) continue;

            const incomers = getIncomerNodeIds(node.id, edges);
            const allIncomersPlanned = incomers.every(id => planned.has(id));

            if (allIncomersPlanned) {
                currentPhase.nodes.push(node);
            }
        }

        if (currentPhase.nodes.length === 0) {
            console.warn("⚠️ Potential cyclic dependency or disconnected node(s)");
            return {
                error: {
                    type: FlowToExecutionPlanValidationError.INVALID_INPUTS,
                    invalidElements: nodes
                        .filter((n) => !planned.has(n.id))
                        .map((n) => ({
                            nodeId: n.id,
                            inputs: [], // optional: add input names if you have them
                        })),
                },
            };
        }

        for (const node of currentPhase.nodes) {
            planned.add(node.id);
        }

        executionPlan.push(currentPhase);
        phaseNumber++;
    }

    return { executionPlan };
}

/**
 * Get IDs of nodes that connect into the given node.
 */
function getIncomerNodeIds(nodeId: string, edges: Edge[]): string[] {
    return edges
        .filter((edge) => edge.target === nodeId)
        .map((edge) => edge.source);
}