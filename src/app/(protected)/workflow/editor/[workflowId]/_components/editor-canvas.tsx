"use client";

import React, { useEffect, useState } from "react";
import { ReactFlowProvider, type Edge, type Node } from "@xyflow/react";
import type { Workflow } from "@prisma/client";
import { FlowValidationContextProvider } from "@/components/context/flow-validation-context";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import FlowEditor from "./flow-editor";
import EditorCanvasSidebar from "./editor-canvas-sidebar";
import Topbar from "./topbar/Topbar";


function EditorCanvas({ workflow }: { workflow: Workflow }) {
    const [selectedNode, setSelectedNode] = useState<Node<Record<string, unknown>, string | undefined> | null>(null);

    return (
        <FlowValidationContextProvider>
            <ReactFlowProvider>
                <div className="flex flex-col h-full w-full overflow-hidden">
                    <Topbar
                        title="Workflow editor"
                        subtitle={workflow.name}
                        workflowId={workflow.id}
                        isPublished={workflow.isActive}
                    />

                    <section className="flex h-full overflow-auto">
                        <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={65}>
                                <FlowEditor
                                    workflow={workflow}
                                    onSelectNode={setSelectedNode}
                                />

                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel
                                defaultSize={35}
                                className="relative sm:block"
                            >
                                <EditorCanvasSidebar selectedNode={selectedNode} />
                            </ResizablePanel>
                        </ResizablePanelGroup>

                    </section>
                </div>
            </ReactFlowProvider>
        </FlowValidationContextProvider>


    );
}

export default EditorCanvas;
