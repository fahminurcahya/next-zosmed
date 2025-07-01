"use client";

import { Button } from "@/components/ui/button";
import type { updateWorkflowSchemaType } from "@/schema/workflow";
import { api } from "@/trpc/react";
import { useReactFlow } from "@xyflow/react";
import { CheckIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function SaveBtn({ workflowId }: { workflowId: string }) {
  const { toObject } = useReactFlow();
  const workflow = api.workflow.update.useMutation();

  const onSave = async (data: updateWorkflowSchemaType) => {
    workflow.mutate(data, {
      onSuccess: () => {
        toast.success("Project created successfully");
      },
      onError: () => {
        toast.error("Failed to create project");
      },
    });
  }

  return (
    <Button
      disabled={workflow.isPending}
      variant={"outline"}
      className="flex items-center gap-2"
      onClick={() => {
        const flowObject = toObject();

        // NEW: Get safety settings from global store
        const safetySettings = (window as any).__workflowSafetySettings;

        // Include safety settings in workflow definition
        const workflowDefinition = JSON.stringify(flowObject);

        onSave({
          id: workflowId,
          definition: workflowDefinition,
        });
      }}
    >
      <CheckIcon size={16} className="stroke-green-400" />
      Save
    </Button>
  );
}
