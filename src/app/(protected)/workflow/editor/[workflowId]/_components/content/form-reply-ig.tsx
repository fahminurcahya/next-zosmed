'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";

const FormReplyIG = () => {

    const [replies, setReplies] = useState(["Oke Cek Dm Sekarang !", "Wah gercep nih, cek dm ya 🖤"]);
    const [newReply, setNewReply] = useState("");
    const [buttons, setButtons] = useState([{ title: "Bel", url: "", enabled: true }]);
    const [newButton, setNewButton] = useState({ title: "", url: "", enabled: true });
    const [dmMessage, setDmMessage] = useState("")


    const addReply = () => {
        if (!newReply.trim()) return;
        setReplies((prev) => [...prev, newReply.trim()]);
        setNewReply("");
    };

    const removeReply = (index: number) => {
        setReplies((prev) => prev.filter((_, i) => i !== index));
    };

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

    return (
        <aside className=" h-full flex flex-col border-l bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
                <h2 className="text-lg font-semibold">Would you like to setup public Reply in the feed?</h2>

                <Card className="p-4 border-2 border-green-500">
                    <h3 className="font-medium text-sm mb-2">Yes, random multiple replies</h3>
                    <div className="space-y-2">
                        {replies.map((reply, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-white"
                            >
                                <span>{reply}</span>
                                <button onClick={() => removeReply(i)} className="text-muted-foreground hover:text-destructive">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Input
                            placeholder="+ New Reply"
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addReply()}
                            className="text-sm"
                        />
                    </div>
                </Card>

                {/* Reply in DM Buttons */}
                <Separator />
                <h2 className="text-lg font-semibold">Reply in DM</h2>
                <Card className="p-4 border-2 border-green-500">
                    {/* Textarea for the DM message */}
                    <Textarea
                        placeholder="Type your DM reply message here..."
                        value={dmMessage}
                        onChange={(e) => setDmMessage(e.target.value)}
                        className="mb-4"
                    />
                    {/* <div className="space-y-2">
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
                            <Button onClick={addButton} className="self-start">+ Add Button</Button>
                        </div>
                    </div> */}
                </Card>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
                <Button className="w-full">
                    Save
                </Button>
            </div>
        </aside>
    );
}


export default FormReplyIG;