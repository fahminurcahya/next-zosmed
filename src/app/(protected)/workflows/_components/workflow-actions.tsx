import { useState } from "react";
import DeleteWorkflowDialog from "./delete-workflow-dialog";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import TooltipWrapper from "@/components/global/tooltip-wrapper";
import { MoreVertical, Trash2 } from "lucide-react";

export function WorkflowActions({
    workflowName,
    workflowId,
}: {
    workflowId: string;
    workflowName: string;
}) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <DeleteWorkflowDialog
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
                workflowName={workflowName}
                workflowId={workflowId}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-gray-50 hover:border-gray-300"
                    >
                        <TooltipWrapper content="More actions">
                            <MoreVertical className="h-4 w-4" />
                        </TooltipWrapper>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive flex items-center gap-2 hover:bg-red-50 hover:text-red-700"
                        onSelect={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}