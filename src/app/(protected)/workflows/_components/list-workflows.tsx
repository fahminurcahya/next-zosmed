'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, InboxIcon } from "lucide-react";
import CreateWorkflowDialog from "./create-workflow-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export function ListWorkflow() {
    const { data: workflows, isLoading, isError } = api.workflow.getWorkflowsForUser.useQuery();
    console.log(workflows)

    if (isLoading) return <UserWorkflowsSkeleton />;
    if (isError || !workflows) return (
        <Alert variant={"destructive"}>
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Something went wrong. Please try again later
            </AlertDescription>
        </Alert>
    );;

    if (workflows.length === 0) {
        return (
            <div className="flex flex-col gap-4 h-full items-center justify-center">
                <div className="rounded-full bg-accent w-20 h-20 flex items-center justify-center">
                    <InboxIcon size={40} className="stroke-primary" />
                </div>
                <div className="flex flex-col gap-1 text-center">
                    <p className=" font-bold">No workflow created yet</p>
                    <p className="text-sm text-muted-foreground">
                        Click the button below to create your first workflow
                    </p>
                </div>
                <CreateWorkflowDialog triggerText="Create your first workflow" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {/* {workflows.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                ))} */}
        </div>
    );

}

function UserWorkflowsSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
            ))}
        </div>
    );
}
