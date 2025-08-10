'use client'
import React, { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { api } from "@/trpc/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Instagram, Loader2, MessageCircle, Zap,
    PlayCircle, AlertCircle, Sparkles, Info,
    Check, ChevronRight, Copy
} from "lucide-react";
import { toast } from "sonner";
import { WorkflowTriggerType } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { autoResponseDMTemplate, basicAutoReplyTemplate, communityWelcomeTemplate, scratchCommentDefinition, scratchDMDefinition, smartSalesFunnelTemplate, supportBotDMTemplate, type WorkflowDefinition } from "@/types/workflow-definition.type";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateWorkflowDialog({ open, onOpenChange }: Props) {
    const router = useRouter();
    const utils = api.useUtils();

    // Form state
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [integrationId, setIntegrationId] = useState("");
    const [triggerType, setTriggerType] = useState<WorkflowTriggerType>("IG_COMMENT_RECEIVED");
    const [useTemplate, setUseTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("basic-reply");
    const [activateNow, setActivateNow] = useState(false);

    // Get user's integrations
    const { data: accountsData } = api.instagramConnect.getConnectedAccounts.useQuery();
    const accounts = accountsData?.accounts || [];

    // Create workflow mutation
    const createMutation = api.workflow.create.useMutation({
        onSuccess: (workflow) => {
            toast.success("Workflow created successfully!");
            utils.workflow.list.invalidate();
            utils.workflow.getStats.invalidate();
            onOpenChange(false);

            // Redirect to workflow editor
            router.push(`/workflow/editor/${workflow.id}`);
        },
        onError: (error) => {
            console.log(error.message)
            toast.error(error.message || "Failed to create workflow");
        },
    });

    const handleCreate = () => {
        if (!name.trim() || !integrationId) {
            toast.error("Please fill in all required fields");
            return;
        }

        const definition = getTemplateDefinition(useTemplate, selectedTemplate, triggerType);
        const workflow = {
            name: name.trim(),
            description: description.trim() || undefined,
            integrationId,
            triggerType,
            definition,
            isActive: activateNow,
        }
        createMutation.mutate(workflow);
    };

    const handleNext = () => {
        if (step === 1 && (!name.trim() || !integrationId)) {
            toast.error("Please fill in all required fields");
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const resetForm = () => {
        setStep(1);
        setName("");
        setDescription("");
        setIntegrationId("");
        setTriggerType("IG_COMMENT_RECEIVED");
        setUseTemplate(false);
        setSelectedTemplate("");
        setActivateNow(false);
    };

    // Reset form when modal closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        Create New Workflow
                    </DialogTitle>
                    <DialogDescription>
                        Set up an automated workflow to engage with your Instagram audience
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                {/* Progress Step Indicator */}
                <div className="flex items-center justify-between mb-6 flex-shrink-0 w-full max-w-md px-2">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            {/* Step Circle */}
                            <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-colors duration-300 ease-in-out
                            ${step >= s
                                    ? 'bg-blue-600 text-white' // Active or completed step
                                    : 'bg-gray-200 text-gray-500' // Inactive step
                                }
                        `}>
                                {/* Display Check icon if step is completed, otherwise display step number */}
                                {step > s ? <Check className="h-5 w-5" /> : s}
                            </div>

                            {/* Connecting Line (hidden for the last step) */}
                            {s < 3 && (
                                <div className={`
                                flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ease-in-out
                                ${step > s ? 'bg-blue-600' : 'bg-gray-300'} // Line color based on completion
                            `} />
                            )}
                        </React.Fragment>
                    ))}
                </div>


                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-1 -mx-1">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 pr-1"
                            >
                                <div>
                                    <Label htmlFor="name">Workflow Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Auto Reply to Product Inquiries"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what this workflow does..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="integration">Instagram Account *</Label>
                                    {accounts.length === 0 ? (
                                        <Alert className="mt-1">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                No Instagram accounts connected.
                                                <Button
                                                    variant="link"
                                                    className="px-1"
                                                    onClick={() => router.push("/integrations")}
                                                >
                                                    Connect an account
                                                </Button>
                                                to continue.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <Select value={integrationId} onValueChange={setIntegrationId}>
                                            <SelectTrigger className="mt-1 w-full">
                                                <SelectValue placeholder="Select an account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Instagram className="h-4 w-4" />
                                                            @{account.accountUsername}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Trigger Type */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 pr-1"
                            >
                                <div>
                                    <Label className="text-base font-medium">When should this workflow run?</Label>
                                    <RadioGroup
                                        value={triggerType}
                                        onValueChange={(v) => setTriggerType(v as WorkflowTriggerType)}
                                        className="mt-3 space-y-3"
                                    >
                                        <Card className={`p-4 cursor-pointer transition-all ${triggerType === "IG_COMMENT_RECEIVED"
                                            ? 'border-purple-500 bg-purple-50/50'
                                            : 'hover:border-purple-300'
                                            }`}
                                            onClick={() => setTriggerType("IG_COMMENT_RECEIVED")}>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <RadioGroupItem value="IG_COMMENT_RECEIVED" className="mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MessageCircle className="h-4 w-4 text-purple-600" />
                                                        <span className="font-medium">When someone comments</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Trigger when users comment on your posts
                                                    </p>
                                                </div>
                                            </label>
                                        </Card>

                                        <Card className={`p-4 cursor-pointer transition-all ${triggerType === "IG_DM_RECEIVED"
                                            ? 'border-purple-500 bg-purple-50/50'
                                            : 'hover:border-purple-300'
                                            }`}
                                            onClick={() => setTriggerType("IG_DM_RECEIVED")}>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <RadioGroupItem value="IG_DM_RECEIVED" className="mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Instagram className="h-4 w-4 text-purple-600" />
                                                        <span className="font-medium">When someone DMs you</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Trigger when you receive direct messages
                                                    </p>
                                                </div>
                                            </label>
                                        </Card>
                                    </RadioGroup>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Template Selection */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 pr-1"
                            >
                                <div>
                                    <Label className="text-base font-medium">How would you like to start?</Label>
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <Button
                                            variant={useTemplate ? "default" : "outline"}
                                            onClick={() => setUseTemplate(true)}
                                            className={`h-auto py-3 ${useTemplate
                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                : ''
                                                }`}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Use Template
                                        </Button>
                                        <Button
                                            variant={!useTemplate ? "default" : "outline"}
                                            onClick={() => setUseTemplate(false)}
                                            className={`h-auto py-3 ${!useTemplate
                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                : ''
                                                }`}
                                        >
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Start from Scratch
                                        </Button>
                                    </div>
                                </div>

                                {useTemplate && (
                                    <div>
                                        <Label className="text-sm text-gray-600 mb-3 block">Select a template</Label>
                                        <RadioGroup
                                            value={selectedTemplate}
                                            onValueChange={setSelectedTemplate}
                                            className="space-y-3"
                                        >
                                            {getTemplatesForTrigger(triggerType).map((template) => (
                                                <Card
                                                    key={template.id}
                                                    className={`p-4 cursor-pointer transition-all ${selectedTemplate === template.id
                                                        ? 'border-purple-500 bg-purple-50/50'
                                                        : 'hover:border-purple-300'
                                                        }`}
                                                    onClick={() => setSelectedTemplate(template.id)}
                                                >
                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                        <RadioGroupItem value={template.id} className="mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium">{template.name}</span>
                                                                {template.isPro && (
                                                                    <Badge variant="secondary" className="text-xs">PRO</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                {template.description}
                                                            </p>
                                                        </div>
                                                    </label>
                                                </Card>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm">Activate workflow now?</p>
                                            <p className="text-xs text-gray-600">
                                                You can always activate it later from the workflow editor
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={activateNow}
                                        onCheckedChange={setActivateNow}
                                    />
                                </div> */}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={createMutation.isPending}
                            >
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        {step < 3 ? (
                            <Button
                                onClick={handleNext}
                                disabled={accounts.length === 0}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCreate}
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Create Workflow
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper functions
const getTemplatesForTrigger = (triggerType: WorkflowTriggerType) => {
    const templates = {
        IG_COMMENT_RECEIVED: [
            {
                id: "basic-reply",
                name: "Basic Auto Reply",
                description: "Reply to comments and send a follow-up DM",
                isPro: false,
            },
            // {
            //     id: "sales-funnel",
            //     name: "Smart Sales Funnel",
            //     description: "Identify interested customers and send personalized offers",
            //     isPro: true,
            // },
            // {
            //     id: "community-welcome",
            //     name: "Community Welcome",
            //     description: "Welcome new commenters and invite them to your community",
            //     isPro: false,
            // },
        ],
        IG_DM_RECEIVED: [
            // {
            //     id: "auto-response",
            //     name: "Auto Response",
            //     description: "Send automated replies to common questions",
            //     isPro: false,
            // },
            // {
            //     id: "support-bot",
            //     name: "Support Bot",
            //     description: "AI-powered customer support assistant",
            //     isPro: true,
            // },
        ],
    };

    return templates[triggerType] || [];
};

export const getTemplateDefinition = (
    useTemplate: boolean,
    templateId: string,
    triggerType: WorkflowTriggerType
): WorkflowDefinition | null => {
    if (triggerType === "IG_COMMENT_RECEIVED") {
        if (useTemplate) {
            switch (templateId) {
                case "basic-reply":
                    return basicAutoReplyTemplate;
                case "sales-funnel":
                    return smartSalesFunnelTemplate;
                case "community-welcome":
                    return communityWelcomeTemplate;
                default:
                    return scratchCommentDefinition;
            }
        } else {
            return scratchCommentDefinition;
        }
    } else if (triggerType === "IG_DM_RECEIVED") {
        if (useTemplate) {
            switch (templateId) {
                case "auto-response":
                    return autoResponseDMTemplate;
                case "support-bot":
                    return supportBotDMTemplate;
                default:
                    return scratchDMDefinition;
            }
        } else {
            return scratchDMDefinition;
        }
    } else {
        return null;
    }

};

