import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import type { TaskType } from "@/types/task.type";
import { CoinsIcon } from "lucide-react";


interface Props {
    taskType: TaskType;
    sourceNodeId?: string;
    sourceHandle?: string;
    onCreateAndConnect?: (sourceNodeId: string, sourceHandle: string, taskType: TaskType) => void;
}

export function TaskMenuBtn({
    taskType,
    sourceNodeId,
    sourceHandle,
    onCreateAndConnect
}: Props) {
    const task = TaskRegistry[taskType];

    const onDragStart = (event: React.DragEvent, type: TaskType) => {
        event.dataTransfer.setData("application/reactflow", type);
        event.dataTransfer.effectAllowed = "move";
    };

    const handleClick = () => {
        if (sourceNodeId && sourceHandle && onCreateAndConnect) {
            onCreateAndConnect(sourceNodeId, sourceHandle, taskType);
        }
    };

    return (
        <Button
            variant={"secondary"}
            className="flex justify-between items-center gap-2 border w-full"
            draggable
            onDragStart={(event) => onDragStart(event, taskType)}
            onClick={handleClick}
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


