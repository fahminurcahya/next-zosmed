import { TaskRegistry } from "@/lib/workflow/task/registry";
import type { AppNode } from "@/types/app-node.type";

export function CalculateWorkflowCost(nodes: AppNode[]) {
  return nodes.reduce((acc, node) => {
    return acc + TaskRegistry[node.data.type].credits;
  }, 0);
}
