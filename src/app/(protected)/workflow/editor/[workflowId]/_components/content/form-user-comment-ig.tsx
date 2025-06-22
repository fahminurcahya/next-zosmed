'use client'

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface IGUserCommentData {
    selectedPostId?: string;
    includeKeywords: string[];
    excludeKeywords: string[];
}

interface FormUserCommentIGProps {
    nodeId: string;
    initialData?: IGUserCommentData;
}

const FormUserCommentIG = ({ nodeId, initialData }: FormUserCommentIGProps) => {
    const { updateNodeData } = useReactFlow();

    // Sample posts
    const samplePosts = [
        { id: "1", src: "https://images.unsplash.com/photo-1556764900-fa065610b0e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aW5zdGFncmFtJTIwZmVlZHxlbnwwfHwwfHx8MA%3D%3D", label: "Post 1" },
        { id: "2", src: "https://images.unsplash.com/photo-1518991043280-1da61d9f3ac5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGluc3RhZ3JhbSUyMGZlZWR8ZW58MHx8MHx8fDA%3D", label: "Post 2" },
        { id: "3", src: "https://images.unsplash.com/photo-1647964186307-7589f0b34bce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW5zdGFncmFtJTIwZmVlZHxlbnwwfHwwfHx8MA%3D%3D", label: "Post 3" },
    ];

    // Initialize state with existing data or defaults
    const [selectedPostId, setSelectedPostId] = useState(initialData?.selectedPostId || "1");
    const [includeKeywords, setIncludeKeywords] = useState(
        initialData?.includeKeywords || ["Mau", "mauuu", "keren", "Mau bg"]
    );
    const [excludeKeywords, setExcludeKeywords] = useState<string[]>(
        initialData?.excludeKeywords || []
    );

    const [inputInclude, setInputInclude] = useState("");
    const [inputExclude, setInputExclude] = useState("");

    // Update node data whenever form state changes
    useEffect(() => {
        const nodeData: IGUserCommentData = {
            selectedPostId,
            includeKeywords,
            excludeKeywords,
        };

        updateNodeData(nodeId, {
            igUserCommentData: nodeData,
        });
    }, [selectedPostId, includeKeywords, excludeKeywords, nodeId, updateNodeData]);


    const addKeyword = (type: "include" | "exclude") => {
        const keyword = type === "include" ? inputInclude.trim() : inputExclude.trim();
        if (!keyword) return;

        if (type === "include") {
            setIncludeKeywords((prev) => [...prev, keyword]);
            setInputInclude("");
        } else {
            setExcludeKeywords((prev) => [...prev, keyword]);
            setInputExclude("");
        }
    };

    const removeKeyword = (type: "include" | "exclude", index: number) => {
        if (type === "include") {
            setIncludeKeywords((prev) => prev.filter((_, i) => i !== index));
        } else {
            setExcludeKeywords((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        // Optional: Add validation or additional save logic here
        console.log('Form saved with data:', {
            selectedPostId,
            includeKeywords,
            excludeKeywords
        });
    };

    return (
        <aside className="h-full flex flex-col border-l bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
                <div>
                    <h1 className="text-lg font-semibold mt-1">
                        Which Post or Reel do you want to use in automation?
                    </h1>
                </div>

                <Card className="border-green-500">
                    <CardContent className="pt-4">
                        <h3 className="text-sm font-medium mb-2">Specific Post or Reel</h3>
                        <ScrollArea className="h-72 rounded-md border">

                            {/* // todo change radiobox tobe combo box */}
                            <RadioGroup
                                value={selectedPostId}
                                onValueChange={setSelectedPostId}
                                className="grid grid-cols-3 gap-2"
                            >
                                {samplePosts.map((post) => (
                                    <label
                                        key={post.id}
                                        htmlFor={post.id}
                                        className="relative rounded-md overflow-hidden border border-muted hover:border-primary cursor-pointer"
                                    >
                                        <RadioGroupItem
                                            value={post.id}
                                            id={post.id}
                                            className="absolute top-2 left-2 z-10 bg-white rounded-full"
                                        />
                                        <Image
                                            src={post.src}
                                            alt={post.label}
                                            width={160}
                                            height={160}
                                            className="w-full object-cover aspect-square"
                                        />
                                    </label>
                                ))}
                            </RadioGroup>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Separator />
                <h2 className="text-lg font-semibold">What will start your DM automation?</h2>

                <Card className="p-4 border-2 border-green-500">
                    <h3 className="font-medium text-sm mb-2">Specific Keywords</h3>

                    {/* Include Section */}
                    <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                            Comments <strong>include</strong> these Keywords:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {includeKeywords.map((kw, i) => (
                                <div key={i} className="flex items-center px-3 py-1 text-sm border rounded-full bg-muted gap-1">
                                    <span>{kw}</span>
                                    <button
                                        onClick={() => removeKeyword("include", i)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <Input
                                placeholder="+ Keyword"
                                value={inputInclude}
                                onChange={(e) => setInputInclude(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addKeyword("include")}
                                className="w-auto h-8 text-sm px-3 py-1 border-dashed border border-muted rounded-full"
                            />
                        </div>
                    </div>

                    {/* Exclude Section */}
                    <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                            Comments <strong>exclude</strong> these Keywords:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {excludeKeywords.map((kw, i) => (
                                <div key={i} className="flex items-center px-3 py-1 text-sm border rounded-full bg-muted gap-1">
                                    <span>{kw}</span>
                                    <button
                                        onClick={() => removeKeyword("exclude", i)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <Input
                                placeholder="+ Keyword"
                                value={inputExclude}
                                onChange={(e) => setInputExclude(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addKeyword("exclude")}
                                className="w-auto h-8 text-sm px-3 py-1 border-dashed border border-muted rounded-full"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Footer */}

            {/* <div className="p-4 border-t bg-white">
                <Button className="w-full" onClick={handleSave}>
                    Save Configuration
                </Button>
            </div> */}
        </aside>
    );
}


export default FormUserCommentIG;