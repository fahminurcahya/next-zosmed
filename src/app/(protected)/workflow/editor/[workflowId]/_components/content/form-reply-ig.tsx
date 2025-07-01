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
import { useReactFlow } from "@xyflow/react";
import { X, Plus, Shield, MessageSquare, Send, AlertTriangle, Zap, Info, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import type { IGReplyData } from "@/types/app-node.type";


interface FormReplyIGProps {
    nodeId: string;
    initialData?: IGReplyData;
}

// Safety presets
const safetyPresets = {
    safe: {
        enabled: true,
        mode: 'safe' as const,
        customLimits: {
            maxRepliesPerHour: 15,
            maxRepliesPerDay: 100,
            delayBetweenReplies: [8, 20] as [number, number]
        },
        contentRules: {
            enableCommentReply: true,
            enableDMReply: true,
            maxMentions: 1,
            maxHashtags: 2
        }
    },
    balanced: {
        enabled: true,
        mode: 'balanced' as const,
        customLimits: {
            maxRepliesPerHour: 25,
            maxRepliesPerDay: 200,
            delayBetweenReplies: [5, 15] as [number, number]
        },
        contentRules: {
            enableCommentReply: true,
            enableDMReply: true,
            maxMentions: 2,
            maxHashtags: 3
        }
    },
    aggressive: {
        enabled: true,
        mode: 'aggressive' as const,
        customLimits: {
            maxRepliesPerHour: 50,
            maxRepliesPerDay: 400,
            delayBetweenReplies: [2, 8] as [number, number]
        },
        contentRules: {
            enableCommentReply: true,
            enableDMReply: true,
            maxMentions: 3,
            maxHashtags: 5
        }
    }
};

const FormReplyIG = ({ nodeId, initialData }: FormReplyIGProps) => {
    const { updateNodeData } = useReactFlow();

    // Initialize with existing data or defaults (BACKWARD COMPATIBLE)
    const [replies, setReplies] = useState(
        initialData?.publicReplies || ["Oke Cek Dm Sekarang !", "Wah gercep nih, cek dm ya 🖤"]
    );
    const [dmMessage, setDmMessage] = useState(initialData?.dmMessage || "");
    const [buttons, setButtons] = useState(
        initialData?.buttons || [{ title: "Bel", url: "", enabled: true }]
    );

    // NEW: Safety configuration with safe defaults
    const [safetyConfig, setSafetyConfig] = useState(
        initialData?.safetyConfig || safetyPresets.safe
    );

    const [newReply, setNewReply] = useState("");
    const [newButton, setNewButton] = useState({ title: "", url: "", enabled: true });
    const [activeTab, setActiveTab] = useState("replies");

    // Update node data whenever form state changes
    useEffect(() => {
        const nodeData: IGReplyData = {
            publicReplies: replies,
            dmMessage,
            buttons,
            safetyConfig, // NEW field
        };

        updateNodeData(nodeId, {
            igReplyData: nodeData,
        });
    }, [replies, dmMessage, buttons, safetyConfig, nodeId, updateNodeData]);

    // Existing functions (unchanged)
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

    // NEW: Auto-detect mode based on current settings
    const detectCurrentMode = (config: typeof safetyConfig): 'safe' | 'balanced' | 'aggressive' | 'custom' => {
        if (!config.customLimits) return 'safe';

        const hourlyRate = config.customLimits.maxRepliesPerHour;
        const maxDelay = config.customLimits.delayBetweenReplies[1];

        // Check if settings match any preset exactly
        const isExactSafe = hourlyRate <= 15 && maxDelay >= 15;
        const isExactBalanced = hourlyRate <= 25 && hourlyRate > 15 && maxDelay >= 10;
        const isExactAggressive = hourlyRate <= 50 && hourlyRate > 25 && maxDelay >= 5;

        if (isExactSafe) return 'safe';
        if (isExactBalanced) return 'balanced';
        if (isExactAggressive) return 'aggressive';

        return 'custom'; // If settings don't match any preset
    };

    // Auto-update mode when settings change
    useEffect(() => {
        const currentMode = detectCurrentMode(safetyConfig);
        if (currentMode !== safetyConfig.mode) {
            setSafetyConfig(prev => ({
                ...prev,
                mode: currentMode
            }));
        }
    }, [safetyConfig.customLimits]);

    // NEW: Validation functions
    const validateNumber = (value: string, min: number = 0, max: number = 999999): number => {
        const parsed = parseInt(value) || 0;
        return Math.max(min, Math.min(max, parsed));
    };

    const validateDelayRange = (min: number, max: number): [number, number] => {
        const validMin = Math.max(0, Math.min(min, 3600)); // Max 1 hour
        const validMax = Math.max(validMin, Math.min(max, 3600)); // Max 1 hour, min = validMin
        return [validMin, validMax];
    };

    // Enhanced update functions with validation
    const updateCustomLimitsWithValidation = (updates: Partial<typeof safetyConfig.customLimits>) => {
        enableCustomMode();

        const newLimits = { ...safetyConfig.customLimits!, ...updates };

        // Apply validation
        if (newLimits.maxRepliesPerHour !== undefined) {
            newLimits.maxRepliesPerHour = validateNumber(newLimits.maxRepliesPerHour.toString(), 1, 200);
        }
        if (newLimits.maxRepliesPerDay !== undefined) {
            newLimits.maxRepliesPerDay = validateNumber(newLimits.maxRepliesPerDay.toString(), 1, 2000);
        }
        if (newLimits.delayBetweenReplies !== undefined) {
            newLimits.delayBetweenReplies = validateDelayRange(
                newLimits.delayBetweenReplies[0],
                newLimits.delayBetweenReplies[1]
            );
        }

        updateCustomLimits(newLimits);
    };

    const updateContentRulesWithValidation = (updates: Partial<typeof safetyConfig.contentRules>) => {
        enableCustomMode();

        const newRules = { ...safetyConfig.contentRules, ...updates };

        // Apply validation
        if (newRules.maxMentions !== undefined) {
            newRules.maxMentions = validateNumber(newRules.maxMentions.toString(), 0, 10);
        }
        if (newRules.maxHashtags !== undefined) {
            newRules.maxHashtags = validateNumber(newRules.maxHashtags.toString(), 0, 30);
        }

        updateContentRules(newRules);
    };

    // Update safety mode and lock/unlock editing
    const updateSafetyMode = (mode: 'safe' | 'balanced' | 'aggressive') => {
        setSafetyConfig(safetyPresets[mode]);
        setIsCustomMode(false); // Reset to preset mode
    };

    // NEW: Track if user is in custom mode
    const [isCustomMode, setIsCustomMode] = useState(false);

    // NEW: Enable custom mode when user manually changes values
    const enableCustomMode = () => {
        setIsCustomMode(true);
        setSafetyConfig(prev => ({ ...prev, mode: 'custom' }));
    };

    const updateSafetyConfig = (updates: Partial<typeof safetyConfig>) => {
        setSafetyConfig(prev => ({ ...prev, ...updates }));
    };

    const updateCustomLimits = (updates: Partial<typeof safetyConfig.customLimits>) => {
        setSafetyConfig(prev => ({
            ...prev,
            customLimits: { ...prev.customLimits!, ...updates }
        }));
    };

    const updateContentRules = (updates: Partial<typeof safetyConfig.contentRules>) => {
        setSafetyConfig(prev => ({
            ...prev,
            contentRules: { ...prev.contentRules, ...updates }
        }));
    };

    const getSafetyColor = (mode: string) => {
        switch (mode) {
            case 'safe': return 'bg-green-100 text-green-800 border-green-200';
            case 'balanced': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'aggressive': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'custom': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <aside className="h-full flex flex-col border-l bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
                {/* Header */}
                <div>
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-600" />
                        Auto Reply Configuration
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Setup reply messages dan safety settings
                    </p>
                </div>

                {/* Safety Status Card */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">Safety Mode</span>
                            </div>
                            <Badge className={getSafetyColor(safetyConfig.mode)}>
                                {safetyConfig.mode.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {safetyConfig.customLimits?.maxRepliesPerHour || 0} replies/hour,
                            {safetyConfig.customLimits?.delayBetweenReplies?.[0]}-{safetyConfig.customLimits?.delayBetweenReplies?.[1]}s delay
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="replies" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Messages
                        </TabsTrigger>
                        <TabsTrigger value="safety" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Safety
                        </TabsTrigger>
                    </TabsList>

                    {/* Messages Tab - Keep existing functionality */}
                    <TabsContent value="replies" className="space-y-4">
                        {/* Comment Replies */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Comment Replies</CardTitle>
                                    <Switch
                                        checked={safetyConfig.contentRules.enableCommentReply}
                                        onCheckedChange={(enabled) =>
                                            updateContentRules({ enableCommentReply: enabled })
                                        }
                                    />
                                </div>
                                <CardDescription className="text-xs">
                                    Auto replies untuk komentar (random dari template)
                                </CardDescription>
                            </CardHeader>
                            {safetyConfig.contentRules.enableCommentReply && (
                                <CardContent className="space-y-3">
                                    {replies.map((reply, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <span className="flex-1 text-sm">{reply}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeReply(index)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add reply template..."
                                            value={newReply}
                                            onChange={(e) => setNewReply(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addReply()}
                                            className="text-sm"
                                        />
                                        <Button size="sm" onClick={addReply}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* DM Message */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Follow-up DM</CardTitle>
                                    <Switch
                                        checked={safetyConfig.contentRules.enableDMReply}
                                        onCheckedChange={(enabled) =>
                                            updateContentRules({ enableDMReply: enabled })
                                        }
                                    />
                                </div>
                                <CardDescription className="text-xs">
                                    Direct message setelah reply comment
                                </CardDescription>
                            </CardHeader>
                            {safetyConfig.contentRules.enableDMReply && (
                                <CardContent>
                                    <Textarea
                                        placeholder="Write follow-up DM message..."
                                        value={dmMessage}
                                        onChange={(e) => setDmMessage(e.target.value)}
                                        className="text-sm"
                                        rows={3}
                                    />
                                </CardContent>
                            )}
                        </Card>

                        {/* Buttons - Keep existing implementation */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">CTA Buttons</CardTitle>
                                <CardDescription className="text-xs">
                                    Action buttons in DM (max 2)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {buttons.map((button, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{button.title}</div>
                                            <div className="text-xs text-muted-foreground">{button.url}</div>
                                        </div>
                                        <Switch checked={button.enabled} onCheckedChange={() => toggleButton(index)} />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeButton(index)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                {buttons.length < 2 && (
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Button Title"
                                            value={newButton.title}
                                            onChange={(e) => setNewButton(prev => ({
                                                ...prev,
                                                title: e.target.value
                                            }))}
                                            className="text-sm"
                                        />
                                        <Input
                                            placeholder="Website URL"
                                            value={newButton.url}
                                            onChange={(e) => setNewButton(prev => ({
                                                ...prev,
                                                url: e.target.value
                                            }))}
                                            className="text-sm"
                                        />
                                        <Button onClick={addButton} className="w-full" size="sm">
                                            + Add Button
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Safety Tab - NEW */}
                    <TabsContent value="safety" className="space-y-4">
                        {/* Safety Mode Selection with Detailed Explanations */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Safety Mode</CardTitle>
                                <CardDescription className="text-xs">
                                    Pilih tingkat keamanan untuk menghindari pembatasan Instagram
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Info Alert */}
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        <strong>Mengapa safety penting?</strong> Instagram memiliki algoritma untuk mendeteksi aktivitas bot.
                                        Setting yang tepat melindungi akun Anda dari shadowban atau suspend.
                                    </AlertDescription>
                                </Alert>

                                {/* Mode Selection with Smart Detection */}
                                {Object.entries(safetyPresets).map(([mode, preset]) => (
                                    <div
                                        key={mode}
                                        onClick={() => updateSafetyMode(mode as any)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${safetyConfig.mode === mode
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium capitalize text-base">{mode}</span>
                                                {mode === 'safe' && <span className="text-green-600 text-xs">✅ Recommended</span>}
                                                {mode === 'aggressive' && <span className="text-orange-600 text-xs">⚠️ Risky</span>}
                                                {safetyConfig.mode === mode && (
                                                    <span className="text-blue-600 text-xs">• Active</span>
                                                )}
                                            </div>
                                            <Badge className={getSafetyColor(mode)} variant="outline">
                                                {preset.customLimits?.maxRepliesPerHour}/jam
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">
                                                {mode === 'safe' && "Mode Aman (Direkomendasikan)"}
                                                {mode === 'balanced' && "Mode Seimbang"}
                                                {mode === 'aggressive' && "Mode Agresif (Berisiko Tinggi)"}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {mode === 'safe' && (
                                                    <>
                                                        <div className="mb-1"><strong>Cocok untuk:</strong> Akun baru, akun bisnis penting, pemula automation</div>
                                                        <div className="mb-1"><strong>Aktivitas:</strong> 15 reply/jam, delay 8-20 detik</div>
                                                        <div><strong>Risiko:</strong> Sangat rendah, hampir tidak ada kemungkinan kena banned</div>
                                                    </>
                                                )}
                                                {mode === 'balanced' && (
                                                    <>
                                                        <div className="mb-1"><strong>Cocok untuk:</strong> Akun established (&gt;3 bulan), sudah familiar dengan automation</div>
                                                        <div className="mb-1"><strong>Aktivitas:</strong> 25 reply/jam, delay 5-15 detik</div>
                                                        <div><strong>Risiko:</strong> Rendah, dengan pemantauan rutin aman digunakan</div>
                                                    </>
                                                )}
                                                {mode === 'aggressive' && (
                                                    <>
                                                        <div className="mb-1"><strong>Cocok untuk:</strong> Expert user, akun testing, growth hacking</div>
                                                        <div className="mb-1"><strong>Aktivitas:</strong> 50 reply/jam, delay 2-8 detik</div>
                                                        <div><strong>Risiko:</strong> Tinggi, bisa memicu review atau shadowban Instagram</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Custom Mode Indicator */}
                                {safetyConfig.mode === 'custom' && (
                                    <Alert className="bg-purple-50 border-purple-200">
                                        <Settings className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                            <strong>🔧 Custom Mode Active</strong><br />
                                            Anda menggunakan pengaturan kustom yang tidak sesuai dengan preset manapun.
                                            Pastikan Anda memahami risiko dari setiap pengaturan.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Best Practices */}
                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        <strong>Tips Keamanan:</strong>
                                        <ul className="mt-1 text-xs space-y-1">
                                            <li>• Mulai dengan mode Safe, naikkan bertahap jika akun stabil</li>
                                            <li>• Monitor engagement rate, jika turun drastis kurangi aktivitas</li>
                                            <li>• Hindari automation 24/7, gunakan jam aktif normal (9-22)</li>
                                            <li>• Variasikan pesan reply untuk menghindari deteksi spam</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        {/* Rate Limits with Explanations */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Rate Limits</CardTitle>
                                <CardDescription className="text-xs">
                                    Atur batas aktivitas untuk menghindari deteksi sebagai bot
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Educational Info */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium mb-1">💡 Mengapa rate limiting penting?</div>
                                    <div className="text-xs text-muted-foreground">
                                        Instagram memantau pola aktivitas. User normal tidak bisa reply 100 komentar dalam 1 jam.
                                        Rate limit membuat aktivitas bot Anda terlihat seperti manusia asli.
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs flex items-center gap-1">
                                            Per Jam
                                            <span className="text-muted-foreground" title="Maksimal reply dalam 1 jam">ⓘ</span>
                                        </Label>
                                        <Input
                                            min="0"
                                            type="number"
                                            value={safetyConfig.customLimits?.maxRepliesPerHour || 0}
                                            onChange={(e) => {
                                                enableCustomMode(); // Auto switch to custom mode
                                                updateCustomLimits({
                                                    maxRepliesPerHour: parseInt(e.target.value) || 0
                                                });
                                            }}
                                            className="text-sm"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Recommended: 15-25 untuk akun normal
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs flex items-center gap-1">
                                            Per Hari
                                            <span className="text-muted-foreground" title="Maksimal reply dalam 24 jam">ⓘ</span>
                                        </Label>
                                        <Input
                                            min="0"
                                            type="number"
                                            value={safetyConfig.customLimits?.maxRepliesPerDay || 0}
                                            onChange={(e) => {
                                                enableCustomMode(); // Auto switch to custom mode
                                                updateCustomLimits({
                                                    maxRepliesPerDay: parseInt(e.target.value) || 0
                                                });
                                            }}
                                            className="text-sm"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Recommended: 100-200 untuk akun normal
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs flex items-center gap-1">
                                        Delay Antar Reply: {safetyConfig.customLimits?.delayBetweenReplies?.[0]}-{safetyConfig.customLimits?.delayBetweenReplies?.[1]} detik
                                        <span className="text-muted-foreground" title="Jeda waktu acak antar reply">ⓘ</span>
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="3600"
                                            placeholder="Min detik"
                                            value={safetyConfig.customLimits?.delayBetweenReplies?.[0] || 0}
                                            onChange={(e) => {
                                                const current = safetyConfig.customLimits?.delayBetweenReplies || [0, 0];
                                                const newMin = parseInt(e.target.value) || 0;
                                                updateCustomLimitsWithValidation({
                                                    delayBetweenReplies: [newMin, current[1]]
                                                });
                                            }}
                                            onBlur={(e) => {
                                                const current = safetyConfig.customLimits?.delayBetweenReplies || [0, 0];
                                                const validatedRange = validateDelayRange(
                                                    parseInt(e.target.value) || 0,
                                                    current[1]
                                                );
                                                updateCustomLimitsWithValidation({
                                                    delayBetweenReplies: validatedRange
                                                });
                                            }}
                                            className="text-sm"
                                        />
                                        <Input
                                            type="number"
                                            min="0"
                                            max="3600"
                                            placeholder="Max detik"
                                            value={safetyConfig.customLimits?.delayBetweenReplies?.[1] || 0}
                                            onChange={(e) => {
                                                const current = safetyConfig.customLimits?.delayBetweenReplies || [0, 0];
                                                const newMax = parseInt(e.target.value) || 0;
                                                updateCustomLimitsWithValidation({
                                                    delayBetweenReplies: [current[0], newMax]
                                                });
                                            }}
                                            onBlur={(e) => {
                                                const current = safetyConfig.customLimits?.delayBetweenReplies || [0, 0];
                                                const validatedRange = validateDelayRange(
                                                    current[0],
                                                    parseInt(e.target.value) || 0
                                                );
                                                updateCustomLimitsWithValidation({
                                                    delayBetweenReplies: validatedRange
                                                });
                                            }}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Range: 0-3600 detik. Delay acak membuat aktivitas terlihat natural. Recommended: 5-15 detik.
                                        {typeof safetyConfig.customLimits?.delayBetweenReplies?.[0] === "number" &&
                                            typeof safetyConfig.customLimits?.delayBetweenReplies?.[1] === "number" &&
                                            safetyConfig.customLimits.delayBetweenReplies[0] > safetyConfig.customLimits.delayBetweenReplies[1] && (
                                                <span className="text-red-600 block">⚠️ Min delay tidak boleh lebih besar dari max delay</span>
                                            )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content Rules with Explanations */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Content Rules</CardTitle>
                                <CardDescription className="text-xs">
                                    Aturan konten untuk menghindari spam filter Instagram
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Educational Info */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium mb-1">🛡️ Instagram Spam Detection</div>
                                    <div className="text-xs text-muted-foreground">
                                        Instagram otomatis mendeteksi pesan dengan terlalu banyak mention (@) atau hashtag (#).
                                        Batasi penggunaan untuk menghindari pesan dianggap spam.
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs flex items-center gap-1">
                                            Max @mentions
                                            <span className="text-muted-foreground" title="Maksimal mention dalam 1 pesan">ⓘ</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={safetyConfig.contentRules.maxMentions}
                                            onChange={(e) => {
                                                updateContentRulesWithValidation({
                                                    maxMentions: parseInt(e.target.value) || 0
                                                });
                                            }}
                                            onBlur={(e) => {
                                                const value = validateNumber(e.target.value, 0, 10);
                                                if (value !== parseInt(e.target.value)) {
                                                    updateContentRulesWithValidation({
                                                        maxMentions: value
                                                    });
                                                }
                                            }}
                                            className="text-sm"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Range: 0-10. Recommended: 0-1 mention per pesan
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs flex items-center gap-1">
                                            Max #hashtags
                                            <span className="text-muted-foreground" title="Maksimal hashtag dalam 1 pesan">ⓘ</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="30"
                                            value={safetyConfig.contentRules.maxHashtags}
                                            onChange={(e) => {
                                                updateContentRulesWithValidation({
                                                    maxHashtags: parseInt(e.target.value) || 0
                                                });
                                            }}
                                            onBlur={(e) => {
                                                const value = validateNumber(e.target.value, 0, 30);
                                                if (value !== parseInt(e.target.value)) {
                                                    updateContentRulesWithValidation({
                                                        maxHashtags: value
                                                    });
                                                }
                                            }}
                                            className="text-sm"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Range: 0-30. Recommended: 1-2 hashtag per pesan
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Recommended: 1-2 hashtag per pesan
                                    </div>
                                </div>
                                <CardContent />

                                {/* Content Tips */}
                                <Alert className="bg-green-50 border-green-200">
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        <strong>Tips Konten Aman:</strong>
                                        <ul className="mt-1 text-xs space-y-1">
                                            <li>• Hindari kata "link in bio", "DM for info" - sering dianggap spam</li>
                                            <li>• Gunakan emoji secukupnya, jangan berlebihan</li>
                                            <li>• Variasikan template reply, jangan copy-paste sama terus</li>
                                            <li>• Hindari ALL CAPS atau terlalu banyak tanda seru!!!</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        {/* Master Safety Toggle with Warning */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">Master Safety Control</CardTitle>
                                        <CardDescription className="text-xs">
                                            Kontrol utama untuk mengaktifkan/menonaktifkan semua proteksi
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={safetyConfig.enabled}
                                        onCheckedChange={(enabled) => updateSafetyConfig({ enabled })}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {safetyConfig.enabled ? (
                                    <Alert className="bg-green-50 border-green-200">
                                        <Shield className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                            <strong>✅ Proteksi Aktif</strong><br />
                                            Semua safety checks berjalan normal. Akun Anda terlindungi dari deteksi bot Instagram.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-sm text-red-700">
                                            <strong>⚠️ BAHAYA: Safety Dinonaktifkan!</strong><br />
                                            Semua rate limit dan delay akan diabaikan. Bot akan berjalan tanpa batasan apapun.
                                            <div className="mt-2 text-xs">
                                                <strong>Risiko:</strong>
                                                <ul className="list-disc ml-4 mt-1">
                                                    <li>Account shadowban (reach turun drastis)</li>
                                                    <li>Temporary action block (tidak bisa comment/DM)</li>
                                                    <li>Account suspension permanen</li>
                                                </ul>
                                            </div>
                                            <div className="mt-2 text-xs">
                                                <strong>Hanya nonaktifkan jika:</strong> Testing di akun dummy, expert user, atau debugging.
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Safety Checklist */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium mb-2">📋 Safety Checklist</div>
                                    <div className="space-y-1 text-xs">
                                        <div className={`flex items-center gap-2 ${safetyConfig.enabled ? 'text-green-700' : 'text-red-700'}`}>
                                            {safetyConfig.enabled ? '✅' : '❌'} Rate limiting aktif
                                        </div>
                                        <div className={`flex items-center gap-2 ${safetyConfig.enabled ? 'text-green-700' : 'text-red-700'}`}>
                                            {safetyConfig.enabled ? '✅' : '❌'} Human-like delays
                                        </div>
                                        <div className={`flex items-center gap-2 ${safetyConfig.enabled ? 'text-green-700' : 'text-red-700'}`}>
                                            {safetyConfig.enabled ? '✅' : '❌'} Content filtering
                                        </div>
                                        <div className={`flex items-center gap-2 ${safetyConfig.enabled ? 'text-green-700' : 'text-red-700'}`}>
                                            {safetyConfig.enabled ? '✅' : '❌'} Spam prevention
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Summary */}
                <Card className="bg-gray-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Safety:</span>
                                <Badge className={getSafetyColor(safetyConfig.mode)}>
                                    {safetyConfig.mode.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Comments:</span>
                                <span className="text-xs">
                                    {safetyConfig.contentRules.enableCommentReply ?
                                        `${replies.length} templates` : 'Disabled'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>DM:</span>
                                <span className={`text-xs ${safetyConfig.contentRules.enableDMReply ? 'text-green-600' : 'text-red-600'}`}>
                                    {safetyConfig.contentRules.enableDMReply ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Rate:</span>
                                <span className="text-xs">
                                    {safetyConfig.customLimits?.maxRepliesPerHour}/hour
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </aside >
    );
};

export default FormReplyIG;