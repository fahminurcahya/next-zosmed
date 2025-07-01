// components/workflow-safety-settings.tsx
'use client'
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Shield, Zap, AlertTriangle, Clock, MessageSquare,
    Send, Timer, Calendar, Filter, Info
} from 'lucide-react';

interface SafetySettingsProps {
    value: any;
    onChange: (settings: any) => void;
}

export function WorkflowSafetySettings({ value, onChange }: SafetySettingsProps) {
    const [mode, setMode] = useState<'safe' | 'custom' | 'unsafe'>(
        !value?.enabled ? 'unsafe' :
            value?.useRecommendedLimits ? 'safe' :
                'custom'
    );

    const handleModeChange = (newMode: 'safe' | 'custom' | 'unsafe') => {
        setMode(newMode);

        switch (newMode) {
            case 'safe':
                onChange({
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
                        startHour: 9,
                        endHour: 22
                    }
                });
                break;

            case 'custom':
                onChange({
                    enabled: true,
                    useRecommendedLimits: false,
                    customLimits: value?.customLimits || {
                        commentsPerHour: 50,
                        commentsPerDay: 400,
                        dmsPerHour: 30,
                        dmsPerDay: 200
                    },
                    delays: value?.delays || {
                        enabled: true,
                        minDelay: 3000,
                        maxDelay: 8000
                    },
                    contentSafety: value?.contentSafety || {
                        enabled: true,
                        checkBannedPhrases: false
                    },
                    activeHours: value?.activeHours || {
                        enabled: false
                    }
                });
                break;

            case 'unsafe':
                onChange({ enabled: false });
                break;
        }
    };

    const updateCustomSetting = (path: string[], value: any) => {
        const newSettings = { ...value };
        let current: any = newSettings;

        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i]!;
            if (!current[key]) current[key] = {};
            current = current[key];
        }

        current[path[path.length - 1]!] = value;
        onChange(newSettings);
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5" />
                        Safety Settings
                    </h3>

                    <Tabs value={mode} onValueChange={(v) => handleModeChange(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="safe" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Safe Mode
                            </TabsTrigger>
                            <TabsTrigger value="custom" className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Custom Mode
                            </TabsTrigger>
                            <TabsTrigger value="unsafe" className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                No Limits
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="safe" className="space-y-4 mt-4">
                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Recommended for most users.</strong> Follows Instagram best practices to minimize ban risk.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Comment Limits</Label>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Per Hour</span>
                                            <Badge variant="secondary">25</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Per Day</span>
                                            <Badge variant="secondary">200</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">DM Limits</Label>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Per Hour</span>
                                            <Badge variant="secondary">20</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Per Day</span>
                                            <Badge variant="secondary">100</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-muted-foreground" />
                                        <Label>Human-like Delays</Label>
                                    </div>
                                    <Badge variant="success">5-15 seconds</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <Label>Active Hours</Label>
                                    </div>
                                    <Badge variant="success">9 AM - 10 PM</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <Label>Content Filtering</Label>
                                    </div>
                                    <Badge variant="success">Enabled</Badge>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4 mt-4">
                            <Alert>
                                <Zap className="h-4 w-4" />
                                <AlertDescription>
                                    Customize safety settings based on your needs. Higher limits increase ban risk.
                                </AlertDescription>
                            </Alert>

                            {/* Rate Limits Section */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Rate Limits
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Comments per Hour</Label>
                                        <Input
                                            type="number"
                                            value={value?.customLimits?.commentsPerHour || 50}
                                            onChange={(e) => updateCustomSetting(
                                                ['customLimits', 'commentsPerHour'],
                                                parseInt(e.target.value)
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Comments per Day</Label>
                                        <Input
                                            type="number"
                                            value={value?.customLimits?.commentsPerDay || 400}
                                            onChange={(e) => updateCustomSetting(
                                                ['customLimits', 'commentsPerDay'],
                                                parseInt(e.target.value)
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DMs per Hour</Label>
                                        <Input
                                            type="number"
                                            value={value?.customLimits?.dmsPerHour || 30}
                                            onChange={(e) => updateCustomSetting(
                                                ['customLimits', 'dmsPerHour'],
                                                parseInt(e.target.value)
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>DMs per Day</Label>
                                        <Input
                                            type="number"
                                            value={value?.customLimits?.dmsPerDay || 200}
                                            onChange={(e) => updateCustomSetting(
                                                ['customLimits', 'dmsPerDay'],
                                                parseInt(e.target.value)
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delays Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Timer className="h-4 w-4" />
                                        Delays
                                    </h4>
                                    <Switch
                                        checked={value?.delays?.enabled !== false}
                                        onCheckedChange={(checked) => updateCustomSetting(
                                            ['delays', 'enabled'],
                                            checked
                                        )}
                                    />
                                </div>

                                {value?.delays?.enabled !== false && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Min Delay (ms)</Label>
                                            <Input
                                                type="number"
                                                value={value?.delays?.minDelay || 3000}
                                                onChange={(e) => updateCustomSetting(
                                                    ['delays', 'minDelay'],
                                                    parseInt(e.target.value)
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Delay (ms)</Label>
                                            <Input
                                                type="number"
                                                value={value?.delays?.maxDelay || 8000}
                                                onChange={(e) => updateCustomSetting(
                                                    ['delays', 'maxDelay'],
                                                    parseInt(e.target.value)
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Active Hours Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Active Hours
                                    </h4>
                                    <Switch
                                        checked={value?.activeHours?.enabled === true}
                                        onCheckedChange={(checked) => updateCustomSetting(
                                            ['activeHours', 'enabled'],
                                            checked
                                        )}
                                    />
                                </div>

                                {value?.activeHours?.enabled && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Hour (0-23)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={value?.activeHours?.startHour || 9}
                                                onChange={(e) => updateCustomSetting(
                                                    ['activeHours', 'startHour'],
                                                    parseInt(e.target.value)
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Hour (0-23)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={value?.activeHours?.endHour || 22}
                                                onChange={(e) => updateCustomSetting(
                                                    ['activeHours', 'endHour'],
                                                    parseInt(e.target.value)
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Safety Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Content Safety
                                    </h4>
                                    <Switch
                                        checked={value?.contentSafety?.enabled === true}
                                        onCheckedChange={(checked) => updateCustomSetting(
                                            ['contentSafety', 'enabled'],
                                            checked
                                        )}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="unsafe" className="space-y-4 mt-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>High Risk Mode!</strong> No safety limits applied. Your account may be banned or restricted by Instagram.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-destructive">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    No rate limiting
                                </div>
                                <div className="flex items-center gap-2 text-destructive">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    No delays between actions
                                </div>
                                <div className="flex items-center gap-2 text-destructive">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    No content filtering
                                </div>
                                <div className="flex items-center gap-2 text-destructive">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    24/7 operation
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Only use this mode if you fully understand the risks and have measures in place to protect your account.
                                </AlertDescription>
                            </Alert>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Card>
    );
}