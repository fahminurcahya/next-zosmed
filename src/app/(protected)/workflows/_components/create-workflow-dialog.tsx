"use client";

import React, { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layers2Icon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { createWorkflowSchema, type createWorkflowSchemaType } from "@/schema/workflow";
import CustomDialogHeader from "@/components/global/custom-dialog-header";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";
import { useRouter } from "next/navigation";
import type { Workflow } from "@prisma/client";
import { DialogDescription } from "@radix-ui/react-dialog";

function CreateWorkflowDialog({ triggerText }: { triggerText?: string }) {
    const [open, setOpen] = useState(false);
    const workflow = api.workflow.create.useMutation();
    const router = useRouter();
    const refetch = useRefetch()

    const form = useForm<createWorkflowSchemaType>({
        resolver: zodResolver(createWorkflowSchema),
        defaultValues: {
            name: "",
            description: ""
        },
    });

    const onSubmit = async (data: createWorkflowSchemaType) => {
        workflow.mutate(data, {
            onSuccess: (data: Workflow) => {
                toast.success("Project created successfully");
                // router.push(`/workflow/editor/${data.id}`)
                refetch()
            },
            onError: () => {
                toast.error("Failed to create project");
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
                <Button>{triggerText ?? "Create workflow"}</Button>
            </DialogTrigger>
            <DialogContent className="px-0">
                <DialogDescription />
                <CustomDialogHeader
                    icon={Layers2Icon}
                    title="Create workflow"
                    subTitle="Start building your workflow"
                />
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
                <DialogDescription className="hidden" />
            </DialogContent>
        </Dialog>
    );
}

export default CreateWorkflowDialog;
