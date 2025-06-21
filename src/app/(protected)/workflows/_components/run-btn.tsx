"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

// todo 
export default function RunBtn({ workflowId }: { workflowId: string }) {

    return (
        <Button
            variant={"outline"}
            size={"sm"}
            className="flex items-center gap-2"

        >
            <PlayIcon size={16} />
            Run
        </Button >
    );
}
