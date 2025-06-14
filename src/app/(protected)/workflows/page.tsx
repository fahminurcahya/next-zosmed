import { lazy, Suspense } from "react";
import CreateWorkflowDialog from "./_components/create-workflow-dialog";
import { Skeleton } from "@/components/ui/skeleton";
// import { ListWorkflow } from "./_components/list-workflows";

const ListWorkflow = lazy(() => import('./_components/list-workflows').then(mod => ({ default: mod.ListWorkflow })));


const Page = () => {
    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold">Workflows</h1>
                    <p className="text-muted-foreground">Manage your workflows</p>
                </div>
                <CreateWorkflowDialog />
            </div>

            <div className="h-full py-6">
                <ListWorkflow />
            </div>
        </div>
    );
}





export default Page;