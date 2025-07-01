"use client";
import TooltipWrapper from "@/components/global/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import UnpublishBtn from "./UnpublishBtn";
import SaveBtn from "./SaveBtn";
import PublishBtn from "./PublishBtn";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FormSafetyConfiguration from "../content/form-safety-config-ig";
import SafetyBtn from "./safety-btn";

interface Props {
  title: string;
  subtitle?: string;
  workflowId: string;
  hideButtons?: boolean;
  isPublished?: boolean;
}

export default function Topbar({
  title,
  subtitle,
  workflowId,
  hideButtons = false,
  isPublished = false,
}: Props) {
  const router = useRouter();
  return (
    <header className="flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10">
      <div className="flex gap-1 flex-1">
        <TooltipWrapper content="Back">
          <Button variant={"ghost"} size={"icon"} onClick={() => router.back()}>
            <ChevronLeftIcon size={20} />
          </Button>
        </TooltipWrapper>
        <div>
          <p className="font-bold text-ellipsis truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate text-ellipsis">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-1 flex-1 justify-end">
        {hideButtons === false && (
          <>
            <SafetyBtn workflowId={workflowId} />

            {isPublished && <UnpublishBtn workflowId={workflowId} />}
            {!isPublished && (
              <>
                <SaveBtn workflowId={workflowId} />
                <PublishBtn workflowId={workflowId} />
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}
