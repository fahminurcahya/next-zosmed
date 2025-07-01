import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    AlertTriangle,
    Settings,
    Clock,
    Bot,
    User,
    Info,
    Zap,
    Target,
    Activity
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import type { SafetySettings } from '@/types/app-node.type';


// Safety modes berdasarkan existing system
enum SafetyMode {
    STRICT = 'STRICT',      // Conservative/Recommended limits
    MODERATE = 'MODERATE',  // Balanced approach
    AGGRESSIVE = 'AGGRESSIVE', // High limits, risky
    UNSAFE = 'UNSAFE',      // No safety (customer's risk)
    CUSTOM = 'CUSTOM'       // Custom configuration
}

// Default configurations mengikuti InstagramSafetyConfig yang existing
const defaultModeConfigs: Record<SafetyMode, SafetySettings> = {
    [SafetyMode.STRICT]: {
        enabled: true,
        useRecommendedLimits: true,
        delays: {
            enabled: true,
            minDelay: 8000,
            maxDelay: 20000,
            betweenCommentAndDm: 10000
        },
        contentSafety: {
            enabled: true,
            checkBannedPhrases: true,
            maxMentions: 1,
            maxHashtags: 1,
            maxUrls: 0
        },
        activeHours: {
            enabled: true,
            startHour: 9,
            endHour: 21,
            timezone: "Asia/Jakarta"
        },
        warmupMode: {
            enabled: true,
            days: 7,
            actionsPerDay: 5
        }
    },
    [SafetyMode.MODERATE]: {
        enabled: true,
        useRecommendedLimits: true,
        delays: {
            enabled: true,
            minDelay: 5000,
            maxDelay: 15000,
            betweenCommentAndDm: 8000
        },
        contentSafety: {
            enabled: true,
            checkBannedPhrases: true,
            maxMentions: 1,
            maxHashtags: 2,
            maxUrls: 1
        },
        activeHours: {
            enabled: true,
            startHour: 8,
            endHour: 22,
            timezone: "Asia/Jakarta"
        },
        warmupMode: {
            enabled: true,
            days: 3,
            actionsPerDay: 10
        }
    },
    [SafetyMode.AGGRESSIVE]: {
        enabled: true,
        useRecommendedLimits: false,
        customLimits: {
            commentsPerHour: 50,
            commentsPerDay: 400,
            dmsPerHour: 40,
            dmsPerDay: 200
        },
        delays: {
            enabled: true,
            minDelay: 2000,
            maxDelay: 8000,
            betweenCommentAndDm: 3000
        },
        contentSafety: {
            enabled: false,
            checkBannedPhrases: false,
            maxMentions: 3,
            maxHashtags: 5,
            maxUrls: 2
        },
        activeHours: {
            enabled: false,
            startHour: 0,
            endHour: 24,
            timezone: "Asia/Jakarta"
        },
        warmupMode: {
            enabled: false,
            days: 0,
            actionsPerDay: 999
        }
    },
    [SafetyMode.UNSAFE]: {
        enabled: false  // FlexibleWorkflowExecutor akan detect ini dan jalankan executeUnsafe()
    },
    [SafetyMode.CUSTOM]: {
        enabled: true,
        useRecommendedLimits: false,
        customLimits: {
            commentsPerHour: 25,
            commentsPerDay: 200,
            dmsPerHour: 20,
            dmsPerDay: 100
        },
        delays: {
            enabled: true,
            minDelay: 5000,
            maxDelay: 15000,
            betweenCommentAndDm: 8000
        },
        contentSafety: {
            enabled: true,
            checkBannedPhrases: true,
            maxMentions: 1,
            maxHashtags: 2,
            maxUrls: 1
        },
        activeHours: {
            enabled: true,
            startHour: 9,
            endHour: 22,
            timezone: "Asia/Jakarta"
        },
        warmupMode: {
            enabled: false,
            days: 0,
            actionsPerDay: 50
        }
    }
};

interface SafetyConfigurationFormProps {
    nodeId: string;
    initialSettings?: SafetySettings;
    onSettingsChange?: (settings: SafetySettings) => void; // NEW
}

const FormSafetyConfiguration = ({ nodeId, initialSettings, onSettingsChange // NEW
}: SafetyConfigurationFormProps) => {
    const { updateNodeData } = useReactFlow();

    const [selectedMode, setSelectedMode] = useState<SafetyMode>(SafetyMode.MODERATE);
    const [settings, setSettings] = useState<SafetySettings>(
        initialSettings || defaultModeConfigs[SafetyMode.MODERATE]
    );

    useEffect(() => {
        onSettingsChange?.(settings);
    }, [settings, onSettingsChange]);

    // Update node data ketika settings berubah
    useEffect(() => {
        updateNodeData(nodeId, {
            safetySettings: settings,
        });
    }, [settings, nodeId, updateNodeData]);

    const handleModeChange = (mode: SafetyMode) => {
        setSelectedMode(mode);
        setSettings(defaultModeConfigs[mode]);
    };

    const updateSettings = (updates: Partial<SafetySettings>) => {
        setSettings(prev => ({
            ...prev,
            ...updates
        }));
    };

    const updateNestedSettings = <T extends keyof SafetySettings>(
        section: T,
        updates: Partial<NonNullable<SafetySettings[T]>>
    ) => {
        setSettings(prev => {
            const currentSection = prev[section];
            return {
                ...prev,
                [section]: {
                    ...(currentSection && typeof currentSection === 'object' ? currentSection : {}),
                    ...updates
                }
            };
        });
    };

    const getModeIcon = (mode: SafetyMode) => {
        switch (mode) {
            case SafetyMode.STRICT: return <ShieldCheck className="w-4 h-4" />;
            case SafetyMode.MODERATE: return <Shield className="w-4 h-4" />;
            case SafetyMode.AGGRESSIVE: return <ShieldAlert className="w-4 h-4" />;
            case SafetyMode.UNSAFE: return <ShieldX className="w-4 h-4" />;
            case SafetyMode.CUSTOM: return <Settings className="w-4 h-4" />;
        }
    };

    const getModeColor = (mode: SafetyMode) => {
        switch (mode) {
            case SafetyMode.STRICT: return 'bg-green-100 text-green-800 border-green-200';
            case SafetyMode.MODERATE: return 'bg-blue-100 text-blue-800 border-blue-200';
            case SafetyMode.AGGRESSIVE: return 'bg-orange-100 text-orange-800 border-orange-200';
            case SafetyMode.UNSAFE: return 'bg-red-100 text-red-800 border-red-200';
            case SafetyMode.CUSTOM: return 'bg-purple-100 text-purple-800 border-purple-200';
        }
    };

    const getModeDescription = (mode: SafetyMode) => {
        switch (mode) {
            case SafetyMode.STRICT: return 'Recommended Instagram limits (15-25 actions/hour)';
            case SafetyMode.MODERATE: return 'Balanced approach with safety measures';
            case SafetyMode.AGGRESSIVE: return 'Higher limits, increased risk of restrictions';
            case SafetyMode.UNSAFE: return 'No limits - Risk of account ban (NOT RECOMMENDED)';
            case SafetyMode.CUSTOM: return 'Configure your own safety parameters';
        }
    };

    return (
        <aside className="h-full flex flex-col border-l bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28">
                {/* Header */}
                <div>
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Instagram Safety Settings
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pilih level keamanan untuk automation Anda
                    </p>
                </div>

                {/* Safety Mode Selection */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Safety Mode</CardTitle>
                        <CardDescription className="text-xs">
                            Pilih preset keamanan berdasarkan risk tolerance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={selectedMode}
                            onValueChange={handleModeChange}
                            className="space-y-2"
                        >
                            {Object.values(SafetyMode).map((mode) => (
                                <div key={mode} className="relative">
                                    <RadioGroupItem
                                        value={mode}
                                        id={mode}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={mode}
                                        className={`
                                            flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all text-sm
                                            peer-checked:border-blue-500 peer-checked:bg-blue-50
                                            hover:border-blue-300 hover:bg-blue-25
                                            ${selectedMode === mode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                            ${mode === SafetyMode.UNSAFE ? 'border-red-200 hover:border-red-300' : ''}
                                        `}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {getModeIcon(mode)}
                                                <span className="font-medium">{mode}</span>
                                            </div>
                                            <Badge className={getModeColor(mode)} variant="outline">
                                                {mode === SafetyMode.UNSAFE ? 'RISKY' :
                                                    mode === SafetyMode.AGGRESSIVE ? 'HIGH' :
                                                        mode === SafetyMode.MODERATE ? 'MED' : 'SAFE'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {getModeDescription(mode)}
                                        </p>
                                        {mode === SafetyMode.UNSAFE && (
                                            <Alert className="mt-2 border-red-200 bg-red-50">
                                                <AlertTriangle className="h-3 w-3" />
                                                <AlertDescription className="text-xs text-red-700">
                                                    Warning: No safety limits applied. Risk of account ban!
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Configuration sections - hanya tampil jika bukan UNSAFE mode */}
                {selectedMode !== SafetyMode.UNSAFE && (
                    <>
                        {/* Rate Limits */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            Rate Limits
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Batasi frequency untuk avoid Instagram restrictions
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={!settings.useRecommendedLimits && Boolean(settings.customLimits)}
                                        onCheckedChange={(enabled) => {
                                            if (enabled) {
                                                updateSettings({
                                                    useRecommendedLimits: false,
                                                    customLimits: settings.customLimits || {
                                                        commentsPerHour: 25,
                                                        commentsPerDay: 200,
                                                        dmsPerHour: 20,
                                                        dmsPerDay: 100
                                                    }
                                                });
                                            } else {
                                                updateSettings({ useRecommendedLimits: true });
                                            }
                                        }}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {settings.useRecommendedLimits ? (
                                    <div className="text-sm p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-green-600" />
                                            <span className="font-medium text-green-800">Instagram Recommended Limits</span>
                                        </div>
                                        <div className="text-xs text-green-700 space-y-1">
                                            <div>Comments: 25/hour, 200/day</div>
                                            <div>DMs: 20/hour, 100/day</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Comments/Hour</Label>
                                            <Input
                                                type="number"
                                                value={settings.customLimits?.commentsPerHour || 25}
                                                onChange={(e) => updateNestedSettings('customLimits', {
                                                    commentsPerHour: parseInt(e.target.value) || 25
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Comments/Day</Label>
                                            <Input
                                                type="number"
                                                value={settings.customLimits?.commentsPerDay || 200}
                                                onChange={(e) => updateNestedSettings('customLimits', {
                                                    commentsPerDay: parseInt(e.target.value) || 200
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">DMs/Hour</Label>
                                            <Input
                                                type="number"
                                                value={settings.customLimits?.dmsPerHour || 20}
                                                onChange={(e) => updateNestedSettings('customLimits', {
                                                    dmsPerHour: parseInt(e.target.value) || 20
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">DMs/Day</Label>
                                            <Input
                                                type="number"
                                                value={settings.customLimits?.dmsPerDay || 100}
                                                onChange={(e) => updateNestedSettings('customLimits', {
                                                    dmsPerDay: parseInt(e.target.value) || 100
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delays */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Human-like Delays
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Tambah delay random untuk terlihat natural
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={settings.delays?.enabled || false}
                                        onCheckedChange={(enabled) =>
                                            updateNestedSettings('delays', { enabled })
                                        }
                                    />
                                </div>
                            </CardHeader>
                            {settings.delays?.enabled && (
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-xs">
                                            Min Delay: {(settings.delays?.minDelay || 5000) / 1000}s
                                        </Label>
                                        <Slider
                                            value={[(settings.delays?.minDelay || 5000) / 1000]}
                                            onValueChange={([value]) =>
                                                updateNestedSettings('delays', { minDelay: value! * 1000 })
                                            }
                                            min={1}
                                            max={30}
                                            step={1}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">
                                            Max Delay: {(settings.delays?.maxDelay || 15000) / 1000}s
                                        </Label>
                                        <Slider
                                            value={[(settings.delays?.maxDelay || 15000) / 1000]}
                                            onValueChange={([value]) =>
                                                updateNestedSettings('delays', { maxDelay: value! * 1000 })
                                            }
                                            min={5}
                                            max={60}
                                            step={1}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">
                                            Comment→DM Delay: {(settings.delays?.betweenCommentAndDm || 8000) / 1000}s
                                        </Label>
                                        <Slider
                                            value={[(settings.delays?.betweenCommentAndDm || 8000) / 1000]}
                                            onValueChange={([value]) =>
                                                updateNestedSettings('delays', { betweenCommentAndDm: value! * 1000 })
                                            }
                                            min={1}
                                            max={30}
                                            step={1}
                                            className="mt-2"
                                        />
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Content Safety */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Bot className="w-4 h-4" />
                                            Content Safety
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Filter konten untuk avoid spam detection
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={settings.contentSafety?.enabled || false}
                                        onCheckedChange={(enabled) =>
                                            updateNestedSettings('contentSafety', { enabled })
                                        }
                                    />
                                </div>
                            </CardHeader>
                            {settings.contentSafety?.enabled && (
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={settings.contentSafety?.checkBannedPhrases || false}
                                            onCheckedChange={(checkBannedPhrases) =>
                                                updateNestedSettings('contentSafety', { checkBannedPhrases })
                                            }
                                        />
                                        <Label className="text-xs">Check banned phrases</Label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-xs">Max @mentions</Label>
                                            <Input
                                                type="number"
                                                value={settings.contentSafety?.maxMentions || 1}
                                                onChange={(e) => updateNestedSettings('contentSafety', {
                                                    maxMentions: parseInt(e.target.value) || 1
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Max #hashtags</Label>
                                            <Input
                                                type="number"
                                                value={settings.contentSafety?.maxHashtags || 2}
                                                onChange={(e) => updateNestedSettings('contentSafety', {
                                                    maxHashtags: parseInt(e.target.value) || 2
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Max URLs</Label>
                                            <Input
                                                type="number"
                                                value={settings.contentSafety?.maxUrls || 1}
                                                onChange={(e) => updateNestedSettings('contentSafety', {
                                                    maxUrls: parseInt(e.target.value) || 1
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Active Hours */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Active Hours
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Batasi automation ke jam tertentu
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={settings.activeHours?.enabled || false}
                                        onCheckedChange={(enabled) =>
                                            updateNestedSettings('activeHours', { enabled })
                                        }
                                    />
                                </div>
                            </CardHeader>
                            {settings.activeHours?.enabled && (
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Start Hour</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={settings.activeHours?.startHour || 9}
                                                onChange={(e) => updateNestedSettings('activeHours', {
                                                    startHour: parseInt(e.target.value) || 9
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">End Hour</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={settings.activeHours?.endHour || 22}
                                                onChange={(e) => updateNestedSettings('activeHours', {
                                                    endHour: parseInt(e.target.value) || 22
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Warmup Mode */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            Warmup Mode
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Gradual increase untuk akun baru
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={settings.warmupMode?.enabled || false}
                                        onCheckedChange={(enabled) =>
                                            updateNestedSettings('warmupMode', { enabled })
                                        }
                                    />
                                </div>
                            </CardHeader>
                            {settings.warmupMode?.enabled && (
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Warmup Days</Label>
                                            <Input
                                                type="number"
                                                value={settings.warmupMode?.days || 3}
                                                onChange={(e) => updateNestedSettings('warmupMode', {
                                                    days: parseInt(e.target.value) || 3
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Actions/Day</Label>
                                            <Input
                                                type="number"
                                                value={settings.warmupMode?.actionsPerDay || 10}
                                                onChange={(e) => updateNestedSettings('warmupMode', {
                                                    actionsPerDay: parseInt(e.target.value) || 10
                                                })}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </>
                )}

                {/* Summary/Preview */}
                <Card className="bg-gray-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Configuration Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Safety Mode:</span>
                                <Badge className={getModeColor(selectedMode)}>
                                    {selectedMode}
                                </Badge>
                            </div>
                            {selectedMode !== SafetyMode.UNSAFE && (
                                <>
                                    <div className="flex justify-between">
                                        <span>Rate Limits:</span>
                                        <span className="text-xs">
                                            {settings.useRecommendedLimits ? 'Instagram Recommended' : 'Custom'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Human Delays:</span>
                                        <span className={`text-xs ${settings.delays?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {settings.delays?.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Content Safety:</span>
                                        <span className={`text-xs ${settings.contentSafety?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {settings.contentSafety?.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Active Hours:</span>
                                        <span className="text-xs">
                                            {settings.activeHours?.enabled ?
                                                `${settings.activeHours.startHour}:00 - ${settings.activeHours.endHour}:00` :
                                                '24/7'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Warning for unsafe mode */}
                {selectedMode === SafetyMode.UNSAFE && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm text-red-700">
                            <strong>PERINGATAN:</strong> Mode UNSAFE akan menonaktifkan semua safety checks.
                            FlexibleWorkflowExecutor akan menjalankan executeUnsafe() tanpa batasan apapun.
                            Ini sangat berisiko untuk account Instagram Anda!
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </aside>
    );
};

export default FormSafetyConfiguration;