
'use client'
import { api } from "@/trpc/react";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

import React, { use } from "react";
import Loading from "../../loading";
import NotFoundPage from "@/app/not-found";
import { Warning } from "@/icons/warning";
import Trigger from "@/components/global/automations/trigger";

function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: automation, isLoading } = api.automation.getAutomationById.useQuery({ id: id });

    const query = new QueryClient();
    if (isLoading) return <Loading />
    if (!automation) return <NotFoundPage />

    return (
        <HydrationBoundary state={dehydrate(query)}>
            <section className="relative min-h-screen pb-24">
                <div className="flex gap-x-2">
                    <Warning />
                    When...
                </div>
                <Trigger id={id} data={automation} />
                {/* <ThenNode id={id} />
                <PostNode id={id} /> */}
                {/* <DeleteAutomationButton id={id} /> */}
            </section>
        </HydrationBoundary >
    );
};

export default Page;
