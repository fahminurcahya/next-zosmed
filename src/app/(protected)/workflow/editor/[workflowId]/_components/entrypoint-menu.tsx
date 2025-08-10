"use client";

import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoinsIcon } from "lucide-react";
import { TaskType } from "@/types/task.type";

export default function EntrypointMenu() {
    return (
        <Accordion
            type="multiple"
            className="w-full"
            defaultValue={[
                "instagram",
                "facebook",
                "whatsapp",
            ]}
        >
            <AccordionItem value="instagram">
                <AccordionTrigger className="font-bold">
                    Intagram
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1">
                    <TaskMenuBtn taskType={TaskType.IG_COMMENT_RECEIVED} />
                    <TaskMenuBtn taskType={TaskType.IG_USER_DM} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="facebook">
                <AccordionTrigger className="font-bold">
                    Facebook
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1">
                    Coming soon
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="whatsapp">
                <AccordionTrigger className="font-bold">
                    Whatsapp
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1">
                    Coming soon
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

function TaskMenuBtn({ taskType }: { taskType: TaskType }) {
    const task = TaskRegistry[taskType];

    const onDragStart = (event: React.DragEvent, type: TaskType) => {
        event.dataTransfer.setData("application/reactflow", type);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <Button
            variant={"secondary"}
            className="flex justify-between items-center gap-2 border w-full"
            draggable
            onDragStart={(event) => onDragStart(event, taskType)}
        >
            <div className="flex gap-2">
                {(task.icon!) && <task.icon size={20} />}
                {task.label}
            </div>
            <Badge className="gap-2 flex items-center" variant={"outline"}>
                <CoinsIcon size={16} />
                {task.credits}
            </Badge>
        </Button>
    );
}
