'use client'

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface IGUserDMData {
    includeKeywords: string[];
}

interface FormUserDMIGProps {
    nodeId: string;
    initialData?: IGUserDMData;
}

const FormUserDMIG = ({ nodeId, initialData }: FormUserDMIGProps) => {
    const { updateNodeData } = useReactFlow();

    // Initialize state with existing data or defaults
    const [includeKeywords, setIncludeKeywords] = useState(
        initialData?.includeKeywords || ["Mau", "mauuu", "keren", "Mau bg"]
    );

    const [inputInclude, setInputInclude] = useState("");

    // Update node data whenever form state changes
    useEffect(() => {
        const nodeData: IGUserDMData = {
            includeKeywords,
        };

        updateNodeData(nodeId, {
            igUserDMData: nodeData,
        });
    }, [includeKeywords, nodeId, updateNodeData]);


    const addKeyword = (type: "include" | "exclude") => {
        const keyword = inputInclude.trim()
        if (!keyword) return;

        if (type === "include") {
            setIncludeKeywords((prev) => [...prev, keyword]);
            setInputInclude("");
        }
    };

    const removeKeyword = (type: "include" | "exclude", index: number) => {
        if (type === "include") {
            setIncludeKeywords((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        // Optional: Add validation or additional save logic here
        console.log('Form saved with data:', {
            includeKeywords,
        });
    };

    return (
        <aside className="h-full flex flex-col border-l bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">

                <h2 className="text-lg font-semibold">What will start your DM automation?</h2>

                <Card className="p-4 border-2 border-green-500">
                    <h3 className="font-medium text-sm mb-2">Specific Keywords</h3>

                    {/* Include Section */}
                    <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                            DM <strong>include</strong> these Keywords:
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
                </Card>
            </div>
        </aside>
    );
}


export default FormUserDMIG;