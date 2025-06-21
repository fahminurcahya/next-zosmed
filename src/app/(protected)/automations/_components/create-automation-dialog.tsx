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
import { createAutomationSchema, type createAutomationSchemaType, type createWorkflowSchemaType } from "@/schema/workflow";
import CustomDialogHeader from "@/components/global/custom-dialog-header";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";
import { useRouter } from "next/navigation";
import type { Automation } from "@prisma/client";
import { DialogDescription } from "@radix-ui/react-dialog";

function CreateAutomationDialog({ triggerText }: { triggerText?: string }) {
    const [open, setOpen] = useState(false);
    const automation = api.automation.create.useMutation();
    const router = useRouter();
    // const refetch = useRefetch()

    const form = useForm<createAutomationSchemaType>({
        resolver: zodResolver(createAutomationSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (data: createAutomationSchemaType) => {
        automation.mutate(data, {
            onSuccess: (data: Automation) => {
                toast.success("Project created successfully");
                router.push(`/automation/editor/${data.id}`)
                // refetch()
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
                <Button>{triggerText ?? "Create automation"}</Button>
            </DialogTrigger>
            <DialogContent className="px-0">
                <DialogDescription />
                <CustomDialogHeader
                    icon={Layers2Icon}
                    title="Create Automation"
                    subTitle="Start building your automation"
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
                            <Button type="submit" className="w-full" disabled={automation.isPending}>
                                {!automation.isPending && "Proceed"}
                                {automation.isPending && <Loader2 className="animate-spin" />}
                            </Button>
                        </form>
                    </Form>
                </div>
                <DialogDescription className="hidden" />
            </DialogContent>
        </Dialog>
    );
}

export default CreateAutomationDialog;
