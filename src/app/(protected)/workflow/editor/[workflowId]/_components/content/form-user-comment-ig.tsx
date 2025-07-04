'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { Check, Heart, MessageCircle, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface IGUserCommentData {
    selectedPostId?: string | string[]; // Support both formats
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
    // Instagram-like sample posts dengan metadata
    const samplePosts = [
        {
            id: "1",
            src: "https://images.unsplash.com/photo-1556764900-fa065610b0e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "photo",
            likes: 1247,
            comments: 89,
            caption: "Beautiful sunset vibes 🌅"
        },
        {
            id: "2",
            src: "https://images.unsplash.com/photo-1518991043280-1da61d9f3ac5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "reel",
            likes: 3421,
            comments: 156,
            caption: "Quick coffee tutorial ☕"
        },
        {
            id: "3",
            src: "https://images.unsplash.com/photo-1647964186307-7589f0b34bce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "photo",
            likes: 892,
            comments: 34,
            caption: "Monday motivation 💪"
        },
        {
            id: "4",
            src: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "reel",
            likes: 5123,
            comments: 287,
            caption: "New product launch! 🚀"
        },
        {
            id: "5",
            src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "photo",
            likes: 2156,
            comments: 78,
            caption: "Sneaker collection 👟"
        },
        {
            id: "6",
            src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "photo",
            likes: 1876,
            comments: 92,
            caption: "Office setup goals 💻"
        },
        {
            id: "7",
            src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "reel",
            likes: 4521,
            comments: 203,
            caption: "Workout routine 💪"
        },
        {
            id: "8",
            src: "https://images.unsplash.com/photo-1586953135968-9d82a1681f06?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "photo",
            likes: 3287,
            comments: 145,
            caption: "Food photography tips 📸"
        },
        {
            id: "9",
            src: "https://images.unsplash.com/photo-1522198734915-76c764a8454d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "reel",
            likes: 6789,
            comments: 321,
            caption: "Travel vlog highlights ✈️"
        },
        {
            id: "10",
            src: "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "photo",
            likes: 1543,
            comments: 67,
            caption: "Nature photography 🌿"
        },
        {
            id: "11",
            src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "reel",
            likes: 8234,
            comments: 456,
            caption: "Fashion lookbook 👗"
        },
        {
            id: "12",
            src: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "photo",
            likes: 2987,
            comments: 112,
            caption: "Tech review session 💻"
        },
    ];

    // Convert initial data to array format for easier handling
    const initializeSelectedPosts = (): string[] => {
        if (!initialData?.selectedPostId) return [];
        // Always expect array format now
        return Array.isArray(initialData.selectedPostId) ? initialData.selectedPostId : [initialData.selectedPostId];
    };

    const [selectedPostIds, setSelectedPostIds] = useState<string[]>(initializeSelectedPosts());
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
            // Always use array format
            selectedPostId: selectedPostIds,
            includeKeywords,
            excludeKeywords,
        };

        updateNodeData(nodeId, {
            igUserCommentData: nodeData,
        });
    }, [selectedPostIds, includeKeywords, excludeKeywords, nodeId, updateNodeData]);

    const handlePostSelection = (postId: string) => {
        setSelectedPostIds(prev => {
            if (prev.includes(postId)) {
                return prev.filter(id => id !== postId);
            } else {
                return [...prev, postId];
            }
        });
    };

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
            selectedPostIds,
            includeKeywords,
            excludeKeywords
        });
    };

    return (
        <aside className="h-full flex flex-col border-l bg-gray-50">
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6 pb-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Select Posts
                        </h1>
                        <p className="text-gray-600">
                            Choose which posts or reels to monitor for comments
                        </p>
                    </div>

                    {/* Post Selection - Instagram Grid Style */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Your Posts</h3>
                            <Badge variant="outline" className="bg-white">
                                {selectedPostIds.length} selected
                            </Badge>
                        </div>

                        {/* Instagram-like Grid with Scrollable Container */}
                        <div className="bg-white rounded-xl border shadow-sm">
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-800">Your Posts & Reels</h4>
                                    <Badge variant="outline" className="bg-gray-50">
                                        {samplePosts.length} posts
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Scroll to see all posts • Tap to select multiple
                                </p>
                            </div>

                            {/* Scrollable Grid Container */}
                            <div className="max-h-80 overflow-y-auto p-4">
                                <div className="grid grid-cols-3 gap-1">
                                    {samplePosts.map((post) => {
                                        const isSelected = selectedPostIds.includes(post.id);
                                        return (
                                            <div
                                                key={post.id}
                                                className={cn(
                                                    "relative aspect-square cursor-pointer group transition-all duration-200",
                                                    "hover:scale-105 hover:z-10 hover:shadow-lg rounded-lg overflow-hidden",
                                                    isSelected && "ring-4 ring-blue-500 ring-offset-2"
                                                )}
                                                onClick={() => handlePostSelection(post.id)}
                                            >
                                                {/* Image */}
                                                <Image
                                                    src={post.src}
                                                    alt={`Post ${post.id}`}
                                                    fill
                                                    className="object-cover transition-transform duration-200 group-hover:scale-110"
                                                />

                                                {/* Type indicator */}
                                                <div className="absolute top-2 right-2 z-10">
                                                    {post.type === "reel" && (
                                                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                            Reel
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selection overlay */}
                                                <div className={cn(
                                                    "absolute inset-0 transition-all duration-200",
                                                    isSelected
                                                        ? "bg-blue-500/30"
                                                        : "bg-black/0 group-hover:bg-black/20"
                                                )}>
                                                    {/* Selection checkmark */}
                                                    <div className={cn(
                                                        "absolute top-2 left-2 w-6 h-6 rounded-full border-2 transition-all duration-200",
                                                        "flex items-center justify-center",
                                                        isSelected
                                                            ? "bg-blue-500 border-blue-500"
                                                            : "bg-white/80 border-white group-hover:bg-white group-hover:border-white"
                                                    )}>
                                                        {isSelected && (
                                                            <Check className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>

                                                    {/* Post stats on hover */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="w-3 h-3" />
                                                                <span>{post.likes.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MessageCircle className="w-3 h-3" />
                                                                <span>{post.comments}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Scroll indicator */}
                                {samplePosts.length > 6 && (
                                    <div className="flex justify-center pt-3 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection Status */}
                        <div className={cn(
                            "p-4 rounded-xl border transition-colors duration-200",
                            selectedPostIds.length === 0
                                ? "bg-orange-50 border-orange-200"
                                : "bg-blue-50 border-blue-200"
                        )}>
                            {selectedPostIds.length === 0 ? (
                                <div className="flex items-center gap-2 text-orange-700">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="font-medium">No posts selected</span>
                                    <span className="text-orange-600">- Workflow will not process any comments</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-blue-700">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium">
                                        {selectedPostIds.length} post{selectedPostIds.length > 1 ? 's' : ''} selected
                                    </span>
                                    <span className="text-blue-600">
                                        - Monitoring posts: [{selectedPostIds.join(', ')}]
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Keyword Filters */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">Keyword Filters</h3>
                            <p className="text-sm text-gray-600">
                                Set up keyword filters to control which comments trigger the workflow
                            </p>
                        </div>

                        {/* Include Keywords - Required Section */}
                        <Card className="border-green-200 bg-green-50/50">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <h4 className="font-semibold text-green-800">Include Keywords</h4>
                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                        Required
                                    </Badge>
                                </div>
                                <p className="text-sm text-green-700">
                                    Comments <strong>must contain</strong> at least one of these keywords
                                </p>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="e.g., price, info, buy, order..."
                                            value={inputInclude}
                                            onChange={(e) => setInputInclude(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addKeyword('include')}
                                            className="pr-10 bg-white border-green-200 focus:border-green-500 focus:ring-green-500"
                                        />
                                        <Button
                                            onClick={() => addKeyword('include')}
                                            size="sm"
                                            className="absolute right-1 top-1 h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                                            disabled={!inputInclude.trim()}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-white rounded-lg border border-green-200">
                                    {includeKeywords.map((keyword, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="px-3 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200 cursor-pointer group"
                                            onClick={() => removeKeyword('include', index)}
                                        >
                                            <span className="font-medium">{keyword}</span>
                                            <X className="w-3 h-3 ml-2 opacity-60 group-hover:opacity-100" />
                                        </Badge>
                                    ))}
                                    {includeKeywords.length === 0 && (
                                        <div className="flex items-center justify-center w-full text-sm text-gray-500 italic py-2">
                                            Add keywords that must appear in comments to trigger the workflow
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exclude Keywords - Optional Section */}
                        <Card className="border-orange-200 bg-orange-50/30">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <h4 className="font-semibold text-orange-800">Exclude Keywords</h4>
                                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                        Optional
                                    </Badge>
                                </div>
                                <p className="text-sm text-orange-700">
                                    Comments containing these keywords will be <strong>ignored</strong>
                                </p>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="e.g., spam, fake, scam, bot..."
                                            value={inputExclude}
                                            onChange={(e) => setInputExclude(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addKeyword('exclude')}
                                            className="pr-10 bg-white border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                        <Button
                                            onClick={() => addKeyword('exclude')}
                                            size="sm"
                                            className="absolute right-1 top-1 h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
                                            disabled={!inputExclude.trim()}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white rounded-lg border border-orange-200">
                                    {excludeKeywords.map((keyword, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="px-3 py-1.5 bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors duration-200 cursor-pointer group"
                                            onClick={() => removeKeyword('exclude', index)}
                                        >
                                            <span className="font-medium">{keyword}</span>
                                            <X className="w-3 h-3 ml-2 opacity-60 group-hover:opacity-100" />
                                        </Badge>
                                    ))}
                                    {excludeKeywords.length === 0 && (
                                        <div className="flex items-center justify-center w-full text-sm text-gray-400 italic py-1">
                                            No exclusion filters - all comments (with include keywords) will be processed
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Card */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                Workflow Configuration
                            </h4>
                            <div className="space-y-3 text-sm">
                                {/* Posts Selection */}
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <div>
                                        <span className="font-medium text-gray-800">Posts Monitoring:</span>
                                        <div className="text-gray-600 mt-1">
                                            {selectedPostIds.length === 0
                                                ? "❌ No posts selected - Workflow is inactive"
                                                : `✅ Monitoring ${selectedPostIds.length} post(s): [${selectedPostIds.join(', ')}]`
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Include Keywords */}
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                    <div>
                                        <span className="font-medium text-gray-800">Include Filter:</span>
                                        <div className="text-gray-600 mt-1">
                                            {includeKeywords.length === 0
                                                ? "⚠️ No keywords set - All comments will be processed"
                                                : `✅ Must contain: ${includeKeywords.join(', ')}`
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Exclude Keywords */}
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-100">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                                    <div>
                                        <span className="font-medium text-gray-800">Exclude Filter:</span>
                                        <div className="text-gray-600 mt-1">
                                            {excludeKeywords.length === 0
                                                ? "No exclusions - Optional filter not applied"
                                                : `🚫 Will ignore: ${excludeKeywords.join(', ')}`
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Workflow Status */}
                                <div className={cn(
                                    "flex items-center gap-2 p-3 rounded-lg border font-medium",
                                    selectedPostIds.length === 0 || includeKeywords.length === 0
                                        ? "bg-red-50 border-red-200 text-red-700"
                                        : "bg-green-50 border-green-200 text-green-700"
                                )}>
                                    <div className={cn(
                                        "w-3 h-3 rounded-full",
                                        selectedPostIds.length === 0 || includeKeywords.length === 0
                                            ? "bg-red-500"
                                            : "bg-green-500"
                                    )}></div>
                                    <span>
                                        {selectedPostIds.length === 0
                                            ? "Workflow Inactive: No posts selected"
                                            : includeKeywords.length === 0
                                                ? "Workflow Warning: No include keywords set"
                                                : "Workflow Ready: All requirements met"
                                        }
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </aside>
    );
}


export default FormUserCommentIG;