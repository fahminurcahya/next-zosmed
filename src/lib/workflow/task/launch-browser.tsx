import TaskMenu from "@/app/(protected)/workflow/editor/[workflowId]/_components/task-menu";
import { TaskParamType, TaskType } from "@/types/task.type";
import type { WorkflowTask } from "@/types/workflow.type";
import { CodeIcon, Edit3Icon, GlobeIcon, type LucideProps } from "lucide-react";

export const LaunchBrowserTask = {
  type: TaskType.LAUNCH_BROWSER,
  label: "Launch broswer",
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400" {...props} />
  ),
  isEntryPoint: true,
  credits: 5,
  inputs: [
    {
      name: "Website Url",
      type: TaskParamType.STRING,
      helperText: "eg: https://www.google.com",
      required: true,
      hideHandle: true,
    },
  ] as const,
  outputs: [
    { name: "Web page", type: TaskParamType.BROWSER_INSTANCE },
  ] as const,
} satisfies WorkflowTask;
