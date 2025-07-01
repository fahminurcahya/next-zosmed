// src/app/(protected)/workflow/editor/[workflowId]/_components/topbar/SafetyBtn.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield } from "lucide-react";
import { useCallback, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import SafetyConfigurationForm from "../content/form-safety-config-ig";
import type { SafetySettings } from "@/types/app-node.type";

export default function SafetyBtn({ workflowId }: { workflowId: string }) {
    const [open, setOpen] = useState(false);
    const { toObject, setNodes } = useReactFlow();
    const [currentSafetySettings, setCurrentSafetySettings] = useState<SafetySettings>();

    console.log(currentSafetySettings);

    // Extract current safety settings from workflow definition
    const getCurrentSafetySettings = (): SafetySettings | undefined => {
        try {
            const flowObject = toObject();
            return (flowObject as any).safetySettings;
        } catch {
            return undefined;
        }
    };

    // Handle safety settings change
    const handleSafetySettingsChange = useCallback((settings: SafetySettings) => {
        setCurrentSafetySettings(settings);
        const flowObject = toObject();

        // Create updated workflow definition with safety settings
        const updatedFlow = {
            ...flowObject,
            safetySettings: settings
        };

        // Store in a way that SaveBtn can access
        (window as any).__workflowSafetySettings = settings;

        // Optional: Also update React Flow's internal state
        // This approach stores it as metadata
        setNodes((nodes) =>
            nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    __workflowSafetySettings: settings // Internal storage
                }
            }))
        );
    }, [toObject, setNodes]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Shield size={16} className="stroke-blue-400" />
                    Safety
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Workflow Safety Configuration
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                    <SafetyConfigurationForm
                        nodeId={`workflow-${workflowId}`}
                        initialSettings={getCurrentSafetySettings()}
                        onSettingsChange={handleSafetySettingsChange}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}