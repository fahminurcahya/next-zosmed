// src/app/(protected)/workflow/editor/[workflowId]/_components/content/form-reply-ig.tsx
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useReactFlow } from "@xyflow/react";
import {
    X, Plus, Shield, MessageSquare, Send, AlertTriangle,
    Zap, Info, Settings, Clock, Activity, Target, ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import type { IGReplyData } from "@/types/app-node.type";

interface FormReplyIGProps {
    nodeId: string;
    initialData?: IGReplyData;
}

// Combined Actions Presets
const safetyPresets = {
    safe: {
        maxActionsPerHour: 15,
        maxActionsPerDay: 100,
        delayBetweenActions: [8, 20] as [number, number],
        commentToDmDelay: [10, 30] as [number, number],
        risk: "very-low" as const,
        description: "Conservative untuk akun baru",
        color: "green" as const
    },
    balanced: {
        maxActionsPerHour: 25,
        maxActionsPerDay: 200,
        delayBetweenActions: [5, 15] as [number, number],
        commentToDmDelay: [8, 25] as [number, number],
        risk: "low" as const,
        description: "Balanced untuk growth stabil",
        color: "blue" as const
    },
    aggressive: {
        maxActionsPerHour: 40,
        maxActionsPerDay: 300,
        delayBetweenActions: [3, 10] as [number, number],
        commentToDmDelay: [5, 15] as [number, number],
        risk: "high" as const,
        description: "High volume (risky)",
        color: "orange" as const
    }
};

const FormReplyIG = ({ nodeId, initialData }: FormReplyIGProps) => {
    const { updateNodeData } = useReactFlow();

    // State management
    const [replies, setReplies] = useState(
        initialData?.publicReplies || ["Oke Cek Dm Sekarang !"]
    );
    const [newReply, setNewReply] = useState("");
    const [dmMessage, setDmMessage] = useState(initialData?.dmMessage || "");
    const [buttons, setButtons] = useState(
        initialData?.buttons || [{ title: "Beli", url: "", enabled: true }]
    );
    const [newButton, setNewButton] = useState({ title: "", url: "", enabled: true });
    const [activeTab, setActiveTab] = useState("messages");

    // Safety Config State
    const [safetyConfig, setSafetyConfig] = useState({
        enabled: initialData?.safetyConfig?.enabled ?? true,
        mode: initialData?.safetyConfig?.mode || 'balanced' as 'safe' | 'balanced' | 'aggressive' | 'custom',
        combinedLimits: {
            maxActionsPerHour: initialData?.safetyConfig?.combinedLimits?.maxActionsPerHour || 25,
            maxActionsPerDay: initialData?.safetyConfig?.combinedLimits?.maxActionsPerDay || 200,
            delayBetweenActions: initialData?.safetyConfig?.combinedLimits?.delayBetweenActions || [5, 15] as [number, number],
            commentToDmDelay: initialData?.safetyConfig?.combinedLimits?.commentToDmDelay || [8, 25] as [number, number]
        },
        actionTypes: {
            enableCommentReply: initialData?.safetyConfig?.actionTypes?.enableCommentReply ?? true,
            enableDMReply: initialData?.safetyConfig?.actionTypes?.enableDMReply ?? true
        },
        contentRules: {
            maxMentions: initialData?.safetyConfig?.contentRules?.maxMentions || 2,
            maxHashtags: initialData?.safetyConfig?.contentRules?.maxHashtags || 3
        }
    });

    // Update node data
    useEffect(() => {
        const nodeData: IGReplyData = {
            publicReplies: replies,
            dmMessage,
            buttons,
            safetyConfig
        };

        updateNodeData(nodeId, {
            igReplyData: nodeData,
        });
    }, [replies, dmMessage, buttons, safetyConfig, nodeId, updateNodeData]);

    // Helper functions
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

    const handlePresetChange = (preset: 'safe' | 'balanced' | 'aggressive') => {
        setSafetyConfig({
            ...safetyConfig,
            mode: preset,
            combinedLimits: {
                maxActionsPerHour: safetyPresets[preset].maxActionsPerHour,
                maxActionsPerDay: safetyPresets[preset].maxActionsPerDay,
                delayBetweenActions: safetyPresets[preset].delayBetweenActions,
                commentToDmDelay: safetyPresets[preset].commentToDmDelay
            }
        });
    };

    const calculateUserCapacity = () => {
        const actionsPerUser =
            (safetyConfig.actionTypes.enableCommentReply ? 1 : 0) +
            (safetyConfig.actionTypes.enableDMReply ? 1 : 0);

        if (actionsPerUser === 0) return { hourly: 0, daily: 0 };

        return {
            hourly: Math.floor(safetyConfig.combinedLimits.maxActionsPerHour / actionsPerUser),
            daily: Math.floor(safetyConfig.combinedLimits.maxActionsPerDay / actionsPerUser)
        };
    };

    const getColorForMode = (mode: string) => {
        switch (mode) {
            case 'safe': return 'text-green-600 bg-green-50 border-green-200';
            case 'balanced': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'aggressive': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'custom': return 'text-purple-600 bg-purple-50 border-purple-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <aside className="h-full flex flex-col border-l bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">

                {/* Header with Status */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-600" />
                        <h1 className="text-lg font-semibold">Auto Reply & DM</h1>
                    </div>

                    {/* Quick Status */}
                    <div className={`p-3 rounded-lg border ${getColorForMode(safetyConfig.mode)}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {safetyConfig.enabled ? 'Protected' : 'Unprotected'}
                                </span>
                            </div>
                            <Badge variant={safetyConfig.mode === 'custom' ? 'outline' : 'default'}>
                                {safetyConfig.mode.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="text-xs mt-1">
                            {safetyConfig.combinedLimits.maxActionsPerHour} actions/hour •
                            {safetyConfig.combinedLimits.delayBetweenActions[0]}-{safetyConfig.combinedLimits.delayBetweenActions[1]}s delay
                        </div>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="messages" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Messages
                        </TabsTrigger>
                        <TabsTrigger value="safety" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Safety
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="text-xs">
                            <Settings className="w-3 h-3 mr-1" />
                            Advanced
                        </TabsTrigger>
                    </TabsList>

                    {/* Messages Tab */}
                    <TabsContent value="messages" className="space-y-4">
                        {/* Comment Replies */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">Comment Reply</CardTitle>
                                        <CardDescription className="text-xs">
                                            Random dari template yang ada
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={safetyConfig.actionTypes.enableCommentReply}
                                        onCheckedChange={(checked) =>
                                            setSafetyConfig({
                                                ...safetyConfig,
                                                actionTypes: {
                                                    ...safetyConfig.actionTypes,
                                                    enableCommentReply: checked
                                                }
                                            })
                                        }
                                    />
                                </div>
                            </CardHeader>
                            {safetyConfig.actionTypes.enableCommentReply && (
                                <CardContent className="space-y-3">
                                    {replies.map((reply, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input value={reply} readOnly className="flex-1" />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeReply(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add reply template..."
                                            value={newReply}
                                            onChange={(e) => setNewReply(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addReply()}
                                        />
                                        <Button onClick={addReply}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* DM Message */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">DM Message</CardTitle>
                                        <CardDescription className="text-xs">
                                            Dikirim setelah comment reply
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={safetyConfig.actionTypes.enableDMReply}
                                        onCheckedChange={(checked) =>
                                            setSafetyConfig({
                                                ...safetyConfig,
                                                actionTypes: {
                                                    ...safetyConfig.actionTypes,
                                                    enableDMReply: checked
                                                }
                                            })
                                        }
                                    />
                                </div>
                            </CardHeader>
                            {safetyConfig.actionTypes.enableDMReply && (
                                <CardContent>
                                    <Textarea
                                        placeholder="Type your DM message here..."
                                        value={dmMessage}
                                        onChange={(e) => setDmMessage(e.target.value)}
                                        rows={4}
                                    />
                                </CardContent>
                            )}
                        </Card>

                        {/* Action Buttons */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">CTA Buttons</CardTitle>
                                <CardDescription className="text-xs">
                                    Action buttons untuk DM (max 2)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {buttons.map((btn, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium text-sm">{btn.title}</div>
                                            <div className="text-xs text-muted-foreground">{btn.url || 'No URL'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={btn.enabled}
                                                onCheckedChange={() => toggleButton(i)}
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeButton(i)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {buttons.length < 2 && (
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Button Title"
                                            value={newButton.title}
                                            onChange={(e) =>
                                                setNewButton({ ...newButton, title: e.target.value })
                                            }
                                        />
                                        <Input
                                            placeholder="Website URL"
                                            value={newButton.url}
                                            onChange={(e) =>
                                                setNewButton({ ...newButton, url: e.target.value })
                                            }
                                        />
                                        <Button onClick={addButton} className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Button
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Safety Tab */}
                    <TabsContent value="safety" className="space-y-4">
                        {/* Master Safety Toggle */}
                        <Card className="border-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5" />
                                        <div>
                                            <CardTitle className="text-base">Safety Protection</CardTitle>
                                            <CardDescription className="text-xs">
                                                Protect dari Instagram detection
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={safetyConfig.enabled}
                                        onCheckedChange={(checked) =>
                                            setSafetyConfig({ ...safetyConfig, enabled: checked })
                                        }
                                    />
                                </div>
                            </CardHeader>
                        </Card>

                        {safetyConfig.enabled && (
                            <>
                                {/* Safety Mode Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Action Limits Mode</CardTitle>
                                        <CardDescription className="text-xs">
                                            Pilih preset atau custom limits
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <RadioGroup
                                            value={safetyConfig.mode}
                                            onValueChange={(value: any) => {
                                                if (value !== 'custom') {
                                                    handlePresetChange(value);
                                                } else {
                                                    setSafetyConfig({ ...safetyConfig, mode: 'custom' });
                                                }
                                            }}
                                        >
                                            {Object.entries(safetyPresets).map(([key, preset]) => (
                                                <div
                                                    key={key}
                                                    className={`relative flex items-start space-x-3 py-3 px-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${safetyConfig.mode === key ? 'border-primary ring-2 ring-primary/20' : ''
                                                        }`}
                                                >
                                                    <RadioGroupItem value={key} id={key} className="mt-1" />
                                                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium capitalize">{key}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {preset.description}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-medium">
                                                                    {preset.maxActionsPerHour}/hour
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {preset.maxActionsPerDay}/day
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}

                                            {/* Custom Option */}
                                            <div
                                                className={`relative flex items-start space-x-3 py-3 px-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${safetyConfig.mode === 'custom' ? 'border-primary ring-2 ring-primary/20' : ''
                                                    }`}
                                            >
                                                <RadioGroupItem value="custom" id="custom" className="mt-1" />
                                                <Label htmlFor="custom" className="flex-1 cursor-pointer">
                                                    <div className="font-medium">Custom</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Set your own limits
                                                    </div>
                                                </Label>
                                            </div>
                                        </RadioGroup>

                                        {/* Custom Settings */}
                                        {safetyConfig.mode === 'custom' && (
                                            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs">Max Actions/Hour</Label>
                                                        <Input
                                                            type="number"
                                                            value={safetyConfig.combinedLimits.maxActionsPerHour}
                                                            onChange={(e) =>
                                                                setSafetyConfig({
                                                                    ...safetyConfig,
                                                                    combinedLimits: {
                                                                        ...safetyConfig.combinedLimits,
                                                                        maxActionsPerHour: parseInt(e.target.value) || 0
                                                                    }
                                                                })
                                                            }
                                                            min={1}
                                                            max={100}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Max Actions/Day</Label>
                                                        <Input
                                                            type="number"
                                                            value={safetyConfig.combinedLimits.maxActionsPerDay}
                                                            onChange={(e) =>
                                                                setSafetyConfig({
                                                                    ...safetyConfig,
                                                                    combinedLimits: {
                                                                        ...safetyConfig.combinedLimits,
                                                                        maxActionsPerDay: parseInt(e.target.value) || 0
                                                                    }
                                                                })
                                                            }
                                                            min={1}
                                                            max={1000}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-xs">
                                                        Delay Between Actions: {safetyConfig.combinedLimits.delayBetweenActions[0]}-{safetyConfig.combinedLimits.delayBetweenActions[1]}s
                                                    </Label>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs w-8">{safetyConfig.combinedLimits.delayBetweenActions[0]}s</span>
                                                        <Slider
                                                            value={safetyConfig.combinedLimits.delayBetweenActions}
                                                            onValueChange={(value) =>
                                                                setSafetyConfig({
                                                                    ...safetyConfig,
                                                                    combinedLimits: {
                                                                        ...safetyConfig.combinedLimits,
                                                                        delayBetweenActions: value as [number, number]
                                                                    }
                                                                })
                                                            }
                                                            min={1}
                                                            max={60}
                                                            step={1}
                                                            className="flex-1"
                                                        />
                                                        <span className="text-xs w-8">{safetyConfig.combinedLimits.delayBetweenActions[1]}s</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-xs">
                                                        Comment to DM Delay: {safetyConfig.combinedLimits.commentToDmDelay[0]}-{safetyConfig.combinedLimits.commentToDmDelay[1]}s
                                                    </Label>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs w-8">{safetyConfig.combinedLimits.commentToDmDelay[0]}s</span>
                                                        <Slider
                                                            value={safetyConfig.combinedLimits.commentToDmDelay}
                                                            onValueChange={(value) =>
                                                                setSafetyConfig({
                                                                    ...safetyConfig,
                                                                    combinedLimits: {
                                                                        ...safetyConfig.combinedLimits,
                                                                        commentToDmDelay: value as [number, number]
                                                                    }
                                                                })
                                                            }
                                                            min={1}
                                                            max={60}
                                                            step={1}
                                                            className="flex-1"
                                                        />
                                                        <span className="text-xs w-8">{safetyConfig.combinedLimits.commentToDmDelay[1]}s</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Budget Usage Visualization */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Activity className="h-4 w-4" />
                                            Action Budget Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* User Capacity */}
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">User Capacity</span>
                                                <Target className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Per Hour:</span>
                                                    <span className="ml-2 font-medium">
                                                        ~{calculateUserCapacity().hourly} users
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Per Day:</span>
                                                    <span className="ml-2 font-medium">
                                                        ~{calculateUserCapacity().daily} users
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Distribution */}
                                        <div className="space-y-2">
                                            <Label className="text-xs">Action Distribution</Label>
                                            <div className="space-y-2">
                                                {safetyConfig.actionTypes.enableCommentReply && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-2">
                                                            <MessageSquare className="h-3 h-3" />
                                                            Comment Reply
                                                        </span>
                                                        <Badge variant="secondary">1 action</Badge>
                                                    </div>
                                                )}
                                                {safetyConfig.actionTypes.enableDMReply && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-2">
                                                            <Send className="h-3 h-3" />
                                                            DM Send
                                                        </span>
                                                        <Badge variant="secondary">1 action</Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {(!safetyConfig.actionTypes.enableCommentReply &&
                                                !safetyConfig.actionTypes.enableDMReply) && (
                                                    <Alert className="bg-yellow-50 border-yellow-200">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription className="text-xs">
                                                            No actions enabled! Enable at least one action type.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Safety Disabled Warning */}
                        {!safetyConfig.enabled && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-red-700">
                                    <strong>⚠️ Safety Disabled!</strong><br />
                                    Bot akan berjalan tanpa batasan. Risiko tinggi untuk:
                                    <ul className="list-disc ml-4 mt-1 text-xs">
                                        <li>Shadowban atau penurunan reach</li>
                                        <li>Temporary action block</li>
                                        <li>Account suspension permanen</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-4">
                        {/* Content Rules */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Content Rules</CardTitle>
                                <CardDescription className="text-xs">
                                    Batasi konten untuk menghindari spam detection
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs">Max @mentions</Label>
                                        <Input
                                            type="number"
                                            value={safetyConfig.contentRules.maxMentions}
                                            onChange={(e) =>
                                                setSafetyConfig({
                                                    ...safetyConfig,
                                                    contentRules: {
                                                        ...safetyConfig.contentRules,
                                                        maxMentions: parseInt(e.target.value) || 0
                                                    }
                                                })
                                            }
                                            min={0}
                                            max={10}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Max #hashtags</Label>
                                        <Input
                                            type="number"
                                            value={safetyConfig.contentRules.maxHashtags}
                                            onChange={(e) =>
                                                setSafetyConfig({
                                                    ...safetyConfig,
                                                    contentRules: {
                                                        ...safetyConfig.contentRules,
                                                        maxHashtags: parseInt(e.target.value) || 0
                                                    }
                                                })
                                            }
                                            min={0}
                                            max={30}
                                        />
                                    </div>
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        Instagram mendeteksi spam berdasarkan pattern. Batasi mentions dan hashtags
                                        untuk menghindari flag sebagai spam.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        {/* Testing & Debug Tools */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Testing Tools</CardTitle>
                                <CardDescription className="text-xs">
                                    Tools untuk testing workflow
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        Gunakan dengan hati-hati. Actions akan tetap dihitung dalam rate limit.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => console.log('Test comment reply')}
                                    >
                                        <MessageSquare className="h-3 w-3 mr-2" />
                                        Test Comment Reply
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => console.log('Test DM send')}
                                    >
                                        <Send className="h-3 w-3 mr-2" />
                                        Test DM Send
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => console.log('Test full flow')}
                                    >
                                        <Zap className="h-3 w-3 mr-2" />
                                        Test Full Flow
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Summary */}
                        <Card className="bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-base">Configuration Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Safety Mode:</span>
                                        <Badge variant={safetyConfig.mode === 'custom' ? 'outline' : 'default'}>
                                            {safetyConfig.mode.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Actions/Hour:</span>
                                        <span className="font-medium">{safetyConfig.combinedLimits.maxActionsPerHour}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Actions/Day:</span>
                                        <span className="font-medium">{safetyConfig.combinedLimits.maxActionsPerDay}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Comment Reply:</span>
                                        <Badge variant={safetyConfig.actionTypes.enableCommentReply ? "default" : "secondary"}>
                                            {safetyConfig.actionTypes.enableCommentReply ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">DM Send:</span>
                                        <Badge variant={safetyConfig.actionTypes.enableDMReply ? "default" : "secondary"}>
                                            {safetyConfig.actionTypes.enableDMReply ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">User Capacity:</span>
                                        <span className="font-medium">
                                            ~{calculateUserCapacity().hourly}/hour
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delays:</span>
                                        <span className="text-xs">
                                            {safetyConfig.combinedLimits.delayBetweenActions[0]}-
                                            {safetyConfig.combinedLimits.delayBetweenActions[1]}s
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Comment→DM:</span>
                                        <span className="text-xs">
                                            {safetyConfig.combinedLimits.commentToDmDelay[0]}-
                                            {safetyConfig.combinedLimits.commentToDmDelay[1]}s
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Pro Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-xs space-y-1 text-blue-700">
                                    <li>• Start dengan mode Safe untuk akun baru</li>
                                    <li>• Monitor engagement rate setelah aktivasi</li>
                                    <li>• Jika reach turun, kurangi aktivitas</li>
                                    <li>• Variasikan template reply secara berkala</li>
                                    <li>• Aktifkan DM hanya jika necessary</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </aside>
    );
};

export default FormReplyIG;