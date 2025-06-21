"use client";


import CustomDialogHeader from "@/components/global/custom-dialog-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { duplicateWorkflowSchema, type duplicateWorkflowSchemaType } from "@/schema/workflow";
import { api } from "@/trpc/react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Workflow } from "@prisma/client";
import { CopyIcon, Layers2Icon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function DuplicateWorkflowDialog({ workflowId }: { workflowId?: string }) {
    const [open, setOpen] = useState(false);
    const workflow = api.workflow.duplicate.useMutation();
    const router = useRouter();


    const form = useForm<duplicateWorkflowSchemaType>({
        resolver: zodResolver(duplicateWorkflowSchema),
        defaultValues: {
            workflowId
        },
    });

    const onSubmit = async (data: duplicateWorkflowSchemaType) => {
        workflow.mutate(data, {
            onSuccess: (data: Workflow) => {
                toast.success("Workflow duplicated", { id: "duplicate-workflow" });
                router.push(`/workflows`)
                // refetch()
            },
            onError: () => {
                toast.error("Failed to duplicate workflow", { id: "duplicate-workflow" });
            },
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                form.reset();
                setOpen(open);
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    className={cn(
                        "ml-2 transition-opacity duration-200 opacity-0 group-hover/card:opacity-100"
                    )}
                >
                    <CopyIcon className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </Button>
            </DialogTrigger>
            <DialogContent className="px-0">
                <CustomDialogHeader icon={Layers2Icon} title="Duplicate workflow" />
                <div className="p-6">
                    <Form {...form}>
                        <form
                            className="space-y-8 w-full"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex gap-1 items-center">
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Choose a descriptive and unique name
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex gap-1 items-center">
                                            Description
                                            <p className="text-xs text-muted-foreground">
                                                (optional)
                                            </p>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-none" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Provide a brief description of what your workflow does.
                                            <br /> This is optional but can help you remember the
                                            workflow&apos;s purpose
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={workflow.isPending}>
                                {!workflow.isPending && "Proceed"}
                                {workflow.isPending && <Loader2 className="animate-spin" />}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default DuplicateWorkflowDialog;
