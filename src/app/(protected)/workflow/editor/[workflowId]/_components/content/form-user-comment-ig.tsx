'use client'

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const FormUserCommentIG = () => {
    // Dummy posts
    const samplePosts = [
        { id: "1", src: "/images/post1.jpg", label: "Post 1" },
        { id: "2", src: "/images/post2.jpg", label: "Post 2" },
        { id: "3", src: "/images/post3.jpg", label: "Post 3" },
    ];

    const [includeKeywords, setIncludeKeywords] = useState(["Mau", "mauuu", "keren", "Mau bg"]);
    const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
    const [inputInclude, setInputInclude] = useState("");
    const [inputExclude, setInputExclude] = useState("");
    const [replies, setReplies] = useState(["Oke Cek Dm Sekarang !", "Wah gercep nih, cek dm ya 🖤"]);
    const [newReply, setNewReply] = useState("");


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

    const addReply = () => {
        if (!newReply.trim()) return;
        setReplies((prev) => [...prev, newReply.trim()]);
        setNewReply("");
    };

    const removeReply = (index: number) => {
        setReplies((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <aside className=" h-full flex flex-col border-l bg-white">
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
                            <RadioGroup defaultValue="1" className="grid grid-cols-3 gap-2">
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
                        <p className="text-sm text-muted-foreground">Comments <strong>include</strong> these Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                            {includeKeywords.map((kw, i) => (
                                <div key={i} className="flex items-center px-3 py-1 text-sm border rounded-full bg-muted gap-1">
                                    <span>{kw}</span>
                                    <button onClick={() => removeKeyword("include", i)} className="text-muted-foreground hover:text-destructive">
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

                    <p className="text-xs text-muted-foreground mt-4">
                        Keywords are not case-sensitive, e.g. "Hello" and "hello" are recognised as the same.
                    </p>
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


export default FormUserCommentIG;