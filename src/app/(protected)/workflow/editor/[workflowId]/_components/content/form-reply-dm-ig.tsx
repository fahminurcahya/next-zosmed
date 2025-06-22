'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface IGReplyDMData {
    dmMessage: string;
    buttons: Array<{
        title: string;
        url: string;
        enabled: boolean;
    }>;
}

// New FormReplyIG Component
interface FormReplyDMIGProps {
    nodeId: string;
    initialData?: IGReplyDMData;
}

const FormReplyDMIG = ({ nodeId, initialData }: FormReplyDMIGProps) => {

    const { updateNodeData } = useReactFlow();

    const [buttons, setButtons] = useState(
        initialData?.buttons || [{ title: "Bel", url: "", enabled: true }]
    );
    const [newButton, setNewButton] = useState({ title: "", url: "", enabled: true });
    const [dmMessage, setDmMessage] = useState(initialData?.dmMessage || "");

    // Update node data whenever form state changes
    useEffect(() => {
        const nodeData: IGReplyDMData = {
            dmMessage,
            buttons,
        };

        updateNodeData(nodeId, {
            igReplyData: nodeData,
        });
    }, [dmMessage, buttons, nodeId, updateNodeData]);


    const addButton = () => {
        if (!newButton.title.trim()) return;
        setButtons((prev) => [...prev, newButton]);
        setNewButton({ title: "", url: "", enabled: true });
    };

    const removeButton = (index: number) => {
        setButtons((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleButton = (index: number) => {
        setButtons((prev) =>
            prev.map((btn, i) => (i === index ? { ...btn, enabled: !btn.enabled } : btn))
        );
    };

    const handleSave = () => {
        console.log('Reply form saved with data:', {
            dmMessage,
            buttons
        });
    };

    return (
        <aside className="h-full flex flex-col border-l bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
                {/* Reply in DM */}
                <Separator />
                <h2 className="text-lg font-semibold">Reply in DM</h2>
                <Card className="p-4 border-2 border-green-500">
                    <Textarea
                        placeholder="Type your DM reply message here..."
                        value={dmMessage}
                        onChange={(e) => setDmMessage(e.target.value)}
                        className="mb-4"
                    />
                </Card>

                {/* Buttons Section */}
                <Separator />
                <h2 className="text-lg font-semibold">Action Buttons</h2>
                <Card className="p-4 border-2 border-green-500">
                    <h3 className="font-medium text-sm mb-2">Add buttons to your reply</h3>
                    <div className="space-y-2">
                        {buttons.map((btn, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-muted"
                            >
                                <span>{btn.title}</span>
                                <div className="flex items-center gap-2">
                                    <Switch checked={btn.enabled} onCheckedChange={() => toggleButton(i)} />
                                    <button onClick={() => removeButton(i)} className="text-muted-foreground hover:text-destructive">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                {buttons.length < 2 &&
                    <div className="flex flex-col gap-2">
                        <Input
                            placeholder="Button Title"
                            value={newButton.title}
                            onChange={(e) => setNewButton({ ...newButton, title: e.target.value })}
                        />
                        <Input
                            placeholder="Website URL"
                            value={newButton.url}
                            onChange={(e) => setNewButton({ ...newButton, url: e.target.value })}
                        />
                        <Button onClick={addButton} className="width-full">+ Add Button</Button>
                    </div>
                }
            </div>
        </aside>
    );
}


export default FormReplyDMIG;