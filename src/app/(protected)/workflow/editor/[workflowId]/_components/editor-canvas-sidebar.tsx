'use client'
import React from 'react'
import { Separator } from '@/components/ui/separator'
import type { EditorNodeType } from '@/types/app-node.type'
import { TaskType } from '@/types/task.type'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { useReactFlow, type Node } from '@xyflow/react'
import EntrypointMenu from './entrypoint-menu'
import type { WorkflowTask } from '@/types/workflow.type'

type Props = {
    nodes: EditorNodeType[]
}

const EditorCanvasSidebar = ({ selectedNode }: { selectedNode: Node<Record<string, unknown>, string | undefined> | null }) => {


    if (!selectedNode) {
        return <div className="p-4">
            <EntrypointMenu />
        </div>;
    }

    const data = selectedNode.data as WorkflowTask | undefined

    const taskType = selectedNode.data?.type as TaskType | undefined;

    if (!taskType || !TaskRegistry[taskType]) {
        return <div className="p-4">Unknown task type</div>;
    }

    const task = TaskRegistry[taskType];
    const SidebarComponent = task.sidebarComponent;

    // Get initial data based on task type
    let initialData;
    switch (taskType) {
        case TaskType.IG_USER_COMMENT:
            initialData = selectedNode.data?.igUserCommentData;
            break;
        case TaskType.IG_SEND_MSG:
        case TaskType.IG_SEND_MSG_FROM_DM:
            initialData = selectedNode.data?.igReplyData;
            break;
        case TaskType.IG_USER_DM:
            initialData = selectedNode.data?.igUserDMData;
            break;
        default:
            initialData = undefined;
            break;
    }


    return (
        <>
            <Separator />
            {SidebarComponent && (
                <SidebarComponent
                    nodeId={selectedNode.id}
                    initialData={initialData}
                />
            )}
        </>
    )
}

export default EditorCanvasSidebar
