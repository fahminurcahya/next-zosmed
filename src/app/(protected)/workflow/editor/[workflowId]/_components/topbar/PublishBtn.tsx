"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { PlayIcon, UploadIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function PublishBtn({ workflowId }: { workflowId: string }) {
  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-2"
    >
      <UploadIcon size={16} className="stroke-green-400" />
      Publish
    </Button>
  );
}
