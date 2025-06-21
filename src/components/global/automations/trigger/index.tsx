"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTriggers } from "@/hooks/use-automations";
import Loader from "../../loader";
import { AUTOMATION_TRIGGERS } from "@/lib/automation/automation";
import TriggerButton from "../trigger-button.tsx";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import type { Automation } from "@prisma/client";
import ActiveTrigger from "./active";

type Props = {
  id: string;
  data: any
};

const Trigger = ({ id, data }: Props) => {
  const { types, onSetTrigger, automation } = useTriggers(id);
  const refetch = useRefetch()


  const onSubmit = async () => {
    automation.mutate({ id, trigger: types! }, {
      onSuccess: () => {
        toast.success("Project created successfully");
        refetch()
      },
      onError: () => {
        toast.error("Failed to create project");
      },
    });
  }


  if (data?.trigger?.length > 0) {
    return (
      <div className="flex flex-col gap-y-6 items-center">
        <ActiveTrigger
          type={data.trigger[0].type as "DM" | "COMMENT" | "KEYWORDS"}
          automationId={id}
        />

        {data?.trigger.length > 1 && (
          <>
            <div className="relative w-6/12 my-4">
              <p className="absolute transform  px-2 -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2">
                or
              </p>
              <Separator
                orientation="horizontal"
                className="border-muted border-[1px]"
              />
            </div>
            <ActiveTrigger
              type={data.trigger[1].type as "DM" | "COMMENT" | "KEYWORDS"}
              automationId={id}
            />
          </>
        )}
        <div className="relative w-6/12 my-4">
          <p className="absolute transform  px-2 -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2">
            with key words
          </p>
          <Separator
            orientation="horizontal"
            className="border-muted border-[1px]"
          />
        </div>
        <ActiveTrigger
          type={"KEYWORDS"}
          keywords={data.keywords}
          automationId={id}
        />
        {/* {!data.data.listener && <ThenAction id={id} />} */}
      </div>
    );
  }

  return (
    <TriggerButton label="Add Trigger">
      <div className="flex flex-col gap-y-2">
        {AUTOMATION_TRIGGERS.map((trigger) => (
          <div
            key={trigger.id}
            onClick={() => onSetTrigger(trigger.type)}
            className={cn(
              "hover:opacity-80 text-white rounded-xl flex cursor-pointer flex-col p-3 gap-y-2",
              !types?.find((t) => t === trigger.type)
                ? "bg-background-80"
                : "bg-gradient-to-br from-[#3352CC] font-medium to-[#1C2D70]"
            )}
          >
            <div className="flex gap-x-2 items-center">
              {trigger.icon}
              <p className="font-bold">{trigger.label}</p>
            </div>
            <p className="text-sm font-light">{trigger.description}</p>
          </div>
        ))}
        {/* <Keywords id={id} /> */}
        <Button
          onClick={onSubmit}
          disabled={types?.length === 0}
          className="bg-gradient-to-br from-[#3352CC] font-medium text-white to-[#1C2D70]"
        >
          <Loader state={automation.isPending}>Create Trigger</Loader>
        </Button>
      </div>
    </TriggerButton>
  );
};

export default Trigger;
