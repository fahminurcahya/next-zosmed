'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import React, { useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import type { EditorNodeType } from '@/types/app-node.type'
import { useEditor } from '@/providers/editor-provider'
import TaskMenu from './task-menu'
import type { TaskType } from '@/types/task.type'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import type { Node } from '@xyflow/react'
import EntrypointMenu from './entrypoint-menu'
import type { WorkflowTask } from '@/types/workflow.type'

type Props = {
    nodes: EditorNodeType[]
}

const EditorCanvasSidebar = ({ selectedNode }: { selectedNode: Node<Record<string, unknown>, string | undefined> | null }) => {
    const { state } = useEditor()

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

    return (
        <>
            <Separator />
            {SidebarComponent && <SidebarComponent />}
        </>
    )
}

export default EditorCanvasSidebar
