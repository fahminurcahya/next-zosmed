// src/app/(protected)/workflow/editor/[workflowId]/_components/nodes/node-component.tsx
import { Badge } from "@/components/ui/badge";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import type { AppNodeData } from "@/types/app-node.type";
import type { NodeProps } from "@xyflow/react";
import { memo } from "react";
import NodeCard from "./node-card";
import NodeHeader from "./node-header";
import { NodeInput, NodeInputs } from "./node-inputs";
import { NodeOutput, NodeOutputs } from "./node-outputs";
import { TaskType } from "@/types/task.type";
import TriggerNode from "./trigger-node";
import { cn } from "@/lib/utils";
import { Shield, Clock, MessageSquare, Send, AlertTriangle } from "lucide-react";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

const NodeComponent = memo((props: NodeProps) => {
    const nodeData = props.data as AppNodeData & { onCreateAndConnect?: (sourceNodeId: string, sourceHandle: string, taskType: TaskType) => void };
    const task = TaskRegistry[nodeData.type];
    const DropdownComponent = task.dropdownComponent;

    // Get form data to display in node
    const igCommentData = nodeData.igUserCommentData;
    const igReplyData = nodeData.igReplyData;
    const igDMData = nodeData.igUserDMData;

    const hasIncludeKeywords = igCommentData?.includeKeywords?.length > 0 || igDMData?.includeKeywords?.length > 0;
    const hasExcludeKeywords = igCommentData?.excludeKeywords?.length > 0;

    // Helper component for configuration display
    const ConfigurationDisplay = ({ children, title }: { children: React.ReactNode; title?: string }) => (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            {title && (
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    {title}
                </div>
            )}
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );

    // Helper component for individual config items
    const ConfigItem = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
        <div className="flex items-center gap-2 text-xs">
            {icon && <span className="text-slate-500 dark:text-slate-400">{icon}</span>}
            <span className="font-medium text-slate-700 dark:text-slate-300">{label}:</span>
            <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{value}</span>
        </div>
    );

    // Helper component for keyword lists
    const KeywordList = ({ keywords, type }: { keywords: string[]; type: 'include' | 'exclude' }) => {
        const displayKeywords = keywords.slice(0, 3);
        const hasMore = keywords.length > 3;

        return (
            <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${type === 'include'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {type === 'include' ? '✓' : '✗'} {type}
                </span>
                <div className="flex flex-wrap gap-1 flex-1">
                    {displayKeywords.map((keyword, index) => (
                        <span
                            key={index}
                            className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs"
                        >
                            {keyword}
                        </span>
                    ))}
                    {hasMore && (
                        <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs opacity-70">
                            +{keywords.length - 3} more
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Helper component for displaying formatted message with line breaks
    const FormattedMessage = ({ message, maxLength = 100 }: { message: string; maxLength?: number }) => {
        const shouldTruncate = message.length > maxLength;
        const displayMessage = shouldTruncate ? message.slice(0, maxLength) + '...' : message;

        return (
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded border-l-2 border-blue-300 dark:border-blue-600 max-w-full overflow-hidden">
                <div className="whitespace-pre-wrap break-words leading-relaxed font-mono text-xs">
                    {displayMessage}
                </div>
                {shouldTruncate && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500 italic">
                        Full message: {message.length} characters
                    </div>
                )}
            </div>
        );
    };

    // Combined Actions Safety Display Component
    const CombinedActionsSafetyDisplay = ({ safetyConfig }: { safetyConfig: any }) => {
        if (!safetyConfig) return null;

        const getModeColor = (mode: string) => {
            switch (mode) {
                case 'safe': return 'bg-green-100 text-green-700';
                case 'balanced': return 'bg-blue-100 text-blue-700';
                case 'aggressive': return 'bg-orange-100 text-orange-700';
                case 'custom': return 'bg-purple-100 text-purple-700';
                default: return 'bg-gray-100 text-gray-700';
            }
        };

        return (
            <ConfigurationDisplay title="Combined Actions Safety">
                <div className="space-y-2">
                    {/* Safety Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className={cn(
                                "h-4 w-4",
                                safetyConfig.enabled ? "text-green-600" : "text-gray-400"
                            )} />
                            <span className="text-xs font-medium">
                                {safetyConfig.enabled ? 'Protected' : 'Unprotected'}
                            </span>
                        </div>
                        <Badge className={cn(
                            "text-xs",
                            safetyConfig.enabled ? getModeColor(safetyConfig.mode) : "bg-gray-100"
                        )}>
                            {safetyConfig.mode?.toUpperCase() || 'OFF'}
                        </Badge>
                    </div>

                    {/* Budget Info */}
                    {safetyConfig.enabled && safetyConfig.combinedLimits && (
                        <>
                            <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-slate-500" />
                                <span className="text-xs">
                                    <span className="font-medium">{safetyConfig.combinedLimits.maxActionsPerHour}</span> actions/hour,
                                    <span className="font-medium ml-1">{safetyConfig.combinedLimits.maxActionsPerDay}</span> /day
                                </span>
                            </div>

                            {/* Enabled Actions */}
                            <div className="flex items-center gap-2">
                                {safetyConfig.actionTypes?.enableCommentReply && (
                                    <Badge variant="secondary" className="text-xs">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Comment
                                    </Badge>
                                )}
                                {safetyConfig.actionTypes?.enableDMReply && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Send className="h-3 w-3 mr-1" />
                                        DM
                                    </Badge>
                                )}
                                {!safetyConfig.actionTypes?.enableCommentReply && !safetyConfig.actionTypes?.enableDMReply && (
                                    <Badge variant="destructive" className="text-xs">
                                        No actions enabled
                                    </Badge>
                                )}
                            </div>
                        </>
                    )}

                    {/* Warning if disabled */}
                    {!safetyConfig.enabled && (
                        <div className="flex items-center gap-2 text-yellow-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Running without limits!</span>
                        </div>
                    )}
                </div>
            </ConfigurationDisplay>
        );
    };

    return (
        <NodeInputs>
            {!task.isEntryPoint &&
                <NodeInput key={props.id} nodeId={props.id} />
            }
            <NodeCard nodeId={props.id} isSelected={!!props.selected}>
                <NodeHeader taskType={nodeData.type} nodeId={props.id} />

                {/* Display different configurations based on node type */}
                {/* IG User Comment Configuration */}
                {igCommentData && (
                    <ConfigurationDisplay title="Comment Trigger Configuration">
                        {igCommentData.selectedPostId && (
                            <ConfigItem
                                label="Post ID"
                                value={igCommentData.selectedPostId}
                                icon="📱"
                            />
                        )}
                        {hasIncludeKeywords && igCommentData.includeKeywords.length > 0 && (
                            <KeywordList
                                keywords={igCommentData.includeKeywords}
                                type="include"
                            />
                        )}
                        {hasExcludeKeywords && igCommentData.excludeKeywords.length > 0 && (
                            <KeywordList
                                keywords={igCommentData.excludeKeywords}
                                type="exclude"
                            />
                        )}
                    </ConfigurationDisplay>
                )}

                {/* IG Reply Configuration with Combined Actions */}
                {igReplyData && (
                    <>
                        <ConfigurationDisplay title="Reply Configuration">
                            {/* Comment Reply Templates */}
                            {igReplyData.publicReplies?.length > 0 && (
                                <div>
                                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        Comment Templates ({igReplyData.publicReplies.length})
                                    </div>
                                    {igReplyData.publicReplies.slice(0, 2).map((reply: string, index: number) => (
                                        <div key={index} className="ml-4 mb-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                #{index + 1}: {reply.length > 50 ? reply.slice(0, 50) + '...' : reply}
                                            </span>
                                        </div>
                                    ))}
                                    {igReplyData.publicReplies.length > 2 && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 italic ml-4">
                                            +{igReplyData.publicReplies.length - 2} more templates
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* DM Message */}
                            {igReplyData.dmMessage && (
                                <div>
                                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                        <Send className="h-3 w-3" />
                                        DM Message
                                    </div>
                                    <FormattedMessage message={igReplyData.dmMessage} maxLength={80} />
                                </div>
                            )}

                            {/* Action Buttons */}
                            {igReplyData.buttons?.filter((b: any) => b.enabled).length > 0 && (
                                <ConfigItem
                                    label="CTA Buttons"
                                    value={`${igReplyData.buttons.filter((b: any) => b.enabled).length} active`}
                                    icon="🔗"
                                />
                            )}
                        </ConfigurationDisplay>

                        {/* Combined Actions Safety Display */}
                        {igReplyData.safetyConfig && (
                            <CombinedActionsSafetyDisplay safetyConfig={igReplyData.safetyConfig} />
                        )}
                    </>
                )}

                {/* IG User DM Configuration */}
                {igDMData && (
                    <ConfigurationDisplay title="DM Trigger Configuration">
                        {igDMData.includeKeywords?.length > 0 && (
                            <KeywordList
                                keywords={igDMData.includeKeywords}
                                type="include"
                            />
                        )}
                    </ConfigurationDisplay>
                )}

                {/* Trigger Node Display */}
                {nodeData.type === TaskType.IG_TRIGGER && <TriggerNode />}

                {/* Node Outputs */}
                {Array.isArray(task.outputs) && task.outputs.map((output) => (
                    <NodeOutput key={output.name} output={output} nodeId={props.id}>
                        {DropdownComponent && (
                            <DropdownComponent
                                sourceNodeId={props.id}
                                sourceHandle={output.name}
                                onCreateAndConnect={nodeData.onCreateAndConnect}
                            />
                        )}
                    </NodeOutput>
                ))}

                {/* Dev Mode Information */}
                {DEV_MODE && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                        <div className="font-semibold text-yellow-800 dark:text-yellow-300">Dev Info:</div>
                        <div className="text-yellow-700 dark:text-yellow-400">
                            Node ID: {props.id}
                            <br />
                            Type: {nodeData.type}
                        </div>
                    </div>
                )}

            </NodeCard>

        </NodeInputs>
    );
});

NodeComponent.displayName = "NodeComponent";

export default NodeComponent;