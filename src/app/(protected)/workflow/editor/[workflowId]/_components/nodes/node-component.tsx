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

    return (
        <NodeInputs>
            {!task.isEntryPoint &&
                <NodeInput key={props.id} nodeId={props.id} />
            }
            <NodeCard nodeId={props.id} isSelected={!!props.selected}>
                {DEV_MODE && <Badge>DEV: {props.id}</Badge>}
                <NodeHeader taskType={nodeData.type} nodeId={props.id} />

                {/* Enhanced Instagram Comment Configuration Display */}
                {nodeData.type === TaskType.IG_USER_COMMENT && igCommentData && (
                    <ConfigurationDisplay title="Comment Settings">
                        {igCommentData.selectedPostId && (
                            <ConfigItem
                                label="Target Post"
                                value={igCommentData.selectedPostId}
                                icon="📝"
                            />
                        )}

                        {hasIncludeKeywords && (
                            <KeywordList keywords={igCommentData.includeKeywords} type="include" />
                        )}

                        {hasExcludeKeywords && (
                            <KeywordList keywords={igCommentData.excludeKeywords} type="exclude" />
                        )}

                        {!igCommentData.selectedPostId && !hasIncludeKeywords && !hasExcludeKeywords && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-2">
                                No configuration set
                            </div>
                        )}
                    </ConfigurationDisplay>
                )}

                {/* Enhanced Instagram Comment Configuration Display */}
                {TaskType.IG_USER_DM && igDMData && (
                    <ConfigurationDisplay title="Comment Settings">
                        {hasIncludeKeywords && (
                            <KeywordList keywords={igDMData.includeKeywords} type="include" />
                        )}

                        {!igDMData.selectedPostId && !hasIncludeKeywords && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-2">
                                No configuration set
                            </div>
                        )}
                    </ConfigurationDisplay>
                )}


                {/* Enhanced Instagram Reply Configuration Display */}
                {(nodeData.type === TaskType.IG_SEND_MSG || nodeData.type === TaskType.IG_SEND_MSG_FROM_DM) && igReplyData && (
                    <ConfigurationDisplay title="Reply Settings">
                        {igReplyData.publicReplies?.length > 0 && (
                            <ConfigItem
                                label="Public Replies"
                                value={`${igReplyData.publicReplies.length} template${igReplyData.publicReplies.length !== 1 ? 's' : ''}`}
                                icon="💬"
                            />
                        )}

                        {igReplyData.dmMessage && (
                            <div className="space-y-2">
                                <ConfigItem
                                    label="Direct Message"
                                    value=""
                                    icon="📩"
                                />
                                <div className="pl-5">
                                    <FormattedMessage message={igReplyData.dmMessage} maxLength={150} />
                                </div>
                            </div>
                        )}

                        {igReplyData.buttons?.length > 0 && (
                            <div className="space-y-1">
                                <ConfigItem
                                    label="Action Buttons"
                                    value={`${igReplyData.buttons.length} button${igReplyData.buttons.length !== 1 ? 's' : ''}`}
                                    icon="🔘"
                                />
                                <div className="flex flex-wrap gap-1 pl-5">
                                    {igReplyData.buttons.slice(0, 3).map((button: { title: string; url: string; enabled: boolean }, index: number) => (
                                        <span
                                            key={index}
                                            className={cn(
                                                "px-2 py-1 rounded text-xs font-medium",
                                                button.enabled
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 opacity-50"
                                            )}
                                        >
                                            {button.title || `Button ${index + 1}`}
                                        </span>
                                    ))}
                                    {igReplyData.buttons.length > 3 && (
                                        <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs opacity-70">
                                            +{igReplyData.buttons.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {!igReplyData.publicReplies?.length && !igReplyData.dmMessage && !igReplyData.buttons?.length && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-2">
                                No reply configuration set
                            </div>
                        )}
                    </ConfigurationDisplay>
                )}

                {nodeData.type === TaskType.IG_SAFETY_CONFIG && nodeData.safetySettings && (
                    <ConfigurationDisplay title="Safety Settings">
                        <ConfigItem
                            label="Mode"
                            value={nodeData.safetySettings.enabled ? 'ENABLED' : 'UNSAFE'}
                            icon="🛡️"
                        />
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
            </NodeCard>
        </NodeInputs>
    );
});

NodeComponent.displayName = "NodeComponent";
export default NodeComponent;