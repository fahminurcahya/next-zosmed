"use client";
import { TaskRegistry } from "@/lib/workflow/task/registry";

import {
    addEdge,
    Background,
    BackgroundVariant,
    Controls,
    getOutgoers,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Connection,
    type Edge,
    type NodeMouseHandler,
    type Node,
    Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import type { AppNode } from "@/types/app-node.type";
import { CreateFlowNode } from "@/lib/workflow/create-flow-node";
import type { TaskType } from "@/types/task.type";
import type { Workflow } from "@prisma/client";
import type { Registry } from "@/types/workflow.type";
import NodeComponent from "./nodes/node-component";
import DeletableEdge from "./edges/deletable-edge";

// Define these completely outside the component
const nodeTypes = {
    FlowScrapeNode: NodeComponent,
};

const edgeTypes = {
    default: DeletableEdge,
};

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = { padding: 1 };

function FlowEditor({ workflow, onSelectNode }:
    {
        workflow: Workflow,
        onSelectNode: any;
    }
) {
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();


    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.definition);
            if (!flow) return;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (!flow.viewport) return;
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setViewport({ x, y, zoom });

            if (flow.nodes?.length > 0) {
                function getLastNode(nodes: Node[], edges: Edge[]): Node | undefined {
                    const nodeIdsWithOutgoingEdges = edges.map((edge) => edge.source);
                    return nodes.find((node) => !nodeIdsWithOutgoingEdges.includes(node.id));
                }

                const lastNode = getLastNode(flow.nodes, flow.edges);
                if (lastNode) onSelectNode(lastNode);
                setNodes((nds) =>
                    nds.map((node) => ({
                        ...node,
                        selected: node.id === lastNode?.id,
                    }))
                );
            }
        } catch (error) { }
    }, [workflow.definition, setEdges, setNodes, setViewport]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const taskType = event.dataTransfer.getData("application/reactflow");
            if (typeof taskType === undefined || !taskType) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = CreateFlowNode(taskType as TaskType, position);
            setNodes((nds) => nds.concat(newNode));

        },
        [screenToFlowPosition, setNodes]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
            if (!connection.targetHandle) return;
            // Remove input value if is present on connection
            const node = nodes.find((nd) => nd.id === connection.target);
            if (!node) return;
            const nodeInputs = node.data.inputs;
            updateNodeData(node.id, {
                inputs: {
                    ...nodeInputs,
                    [connection.targetHandle]: "",
                },
            });
        },
        [setEdges, updateNodeData, nodes]
    );

    const createAndConnectNode = useCallback(
        (sourceNodeId: string, sourceHandle: string, taskType: TaskType, position?: { x: number; y: number }) => {
            // console.log('Creating and connecting node:', { sourceNodeId, sourceHandle, taskType });

            // Create position near the source node if not provided
            const sourceNode = nodes.find(n => n.id === sourceNodeId);
            const nodePosition = position || {
                x: (sourceNode?.position.x || 0) + 100,
                y: (sourceNode?.position.y || 0) + 250
            };

            const newNode = CreateFlowNode(taskType, nodePosition);

            // Add the new node first
            setNodes((nds) => {
                const updatedNodes = nds.concat(newNode);

                // Create connection after node is added
                // Find compatible input handle on the new node
                const targetTask = TaskRegistry[taskType];
                const sourceTask = TaskRegistry[sourceNode!.data.type];

                // console.log('Connection details:', { targetTask, sourceTask });

                const connection: Connection = {
                    source: sourceNodeId,
                    sourceHandle: null,  // Required by Connection type
                    target: newNode.id,
                    targetHandle: null,  // Required by Connection type
                };

                // console.log('Creating connection:', connection);

                setEdges((eds) => {
                    try {
                        const result = addEdge({ ...connection, animated: true }, eds);
                        // console.log('Edge created successfully');
                        return result;
                    } catch (error) {
                        console.error('Failed to create edge:', error);
                        return eds;
                    }
                });
                return updatedNodes;
            });

            return newNode;
        },
        [nodes, setNodes, setEdges, updateNodeData]
    );

    // const isValidConnection = useCallback(
    //     (connection: Edge | Connection) => {
    //         console.log(connection.source)
    //         // No self-connections allowed
    //         if (connection.source === connection.target) {
    //             return false;
    //         }


    //         // Same taskParam type connection
    //         const source = nodes.find((node) => node.id === connection.source);
    //         const target = nodes.find((node) => node.id === connection.target);
    //         if (!source || !target) {
    //             console.error("invalid connection: source or target node not found");
    //             return false;
    //         }

    //         const sourceTask = TaskRegistry[source.data.type];
    //         const targetTask = TaskRegistry[target.data.type];

    //         const output = sourceTask.outputs.find(
    //             (o) => o.name === connection.sourceHandle
    //         );

    //         const input = targetTask.inputs.find(
    //             (o) => o.name === connection.targetHandle
    //         );

    //         if (input?.type !== output?.type) {
    //             console.error("invalid connection: type mismatch");
    //             return false;
    //         }

    //         const hasCycle = (node: AppNode, visited = new Set()) => {
    //             if (visited.has(node.id)) return false;
    //             visited.add(node.id);

    //             for (const outgoer of getOutgoers(node, nodes, edges)) {
    //                 if (outgoer.id === connection.source) return true;
    //                 if (hasCycle(outgoer, visited)) return true;
    //             }
    //         };

    //         const detectedCycle = hasCycle(target);
    //         return !detectedCycle;
    //     },
    //     [nodes, edges]
    // );

    const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
        onSelectNode(node);
    }, []);

    // Store the connection function in a ref so nodes can access it
    const createAndConnectRef = useRef(createAndConnectNode);
    createAndConnectRef.current = createAndConnectNode;

    // Pass the connection function through React Flow's context or node data
    const nodesWithConnectionHandler = useMemo(() => {
        return nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onCreateAndConnect: createAndConnectRef.current
            }
        }));
    }, [nodes]);


    return (
        <main className="h-full w-full" >
            <ReactFlow
                nodes={nodesWithConnectionHandler}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                snapToGrid
                snapGrid={snapGrid}
                fitViewOptions={fitViewOptions}
                onNodeClick={onNodeClick}
                fitView
                onDragOver={onDragOver}
                onDrop={onDrop}
                onConnect={onConnect}
            // isValidConnection={isValidConnection}

            >
                <Controls position="top-left" fitViewOptions={fitViewOptions} />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    )
}

export default FlowEditor;