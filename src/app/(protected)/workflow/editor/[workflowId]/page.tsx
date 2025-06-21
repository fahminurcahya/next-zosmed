
'use client'
import { api } from "@/trpc/react";
import React, { use, useEffect } from "react";
import NotFoundPage from "@/app/not-found";
import Loading from "../../../editors/loading";
import EditorCanvas from "./_components/editor-canvas";
import { useSidebar } from "@/components/ui/sidebar";

function Page({ params }: { params: Promise<{ workflowId: string }> }) {
    const { setOpen } = useSidebar()
    useEffect(() => {
        setOpen(false);
    }, [])

    const { workflowId } = use(params);
    const { data: workflow, isLoading, isError } = api.workflow.getWorkflowDetails.useQuery({ id: workflowId });
    if (isLoading) return <Loading />
    if (!workflow) return <NotFoundPage />
    return <EditorCanvas workflow={workflow} />;
}

export default Page;
