export interface WorkflowDefinition {
    // Existing fields
    nodes: Array<{
        id: string;
        type: string;
        data: {
            type: string;
            inputs: any;
            igUserCommentData?: {
                selectedPostId: string[];
                includeKeywords: string[];
                excludeKeywords: string[];
            };
            igReplyData?: {
                publicReplies: string[];
                dmMessage: string;
                buttons?: Array<{
                    title: string;
                    url: string;
                    enabled: boolean;
                }>;
                // Safety overrides per node (NEW)
                safetyOverride?: {
                    skipDelay?: boolean;           // Skip delay for this specific node
                    skipContentCheck?: boolean;     // Skip content safety check
                    customDelay?: number;           // Custom delay for this node
                };
            };
        };
        position: {
            x: number;
            y: number;
        };
    }>;
    edges: Array<{
        source: string;
        target: string;
        animated?: boolean;
    }>;
    viewport?: {
        x: number;
        y: number;
        zoom: number;
    };
}

// Example workflow definitions

// 1. SAFE MODE - Following all best practices
export const safeWorkflowExample: WorkflowDefinition = {
    nodes: [
        {
            id: "node1",
            type: "FlowScrapeNode",
            data: {
                type: "IG_USER_COMMENT",
                inputs: {},
                igUserCommentData: {
                    selectedPostId: ["1"],
                    includeKeywords: ["info", "price"],
                    excludeKeywords: ["spam"]
                }
            },
            position: { x: 100, y: 100 }
        },
        {
            id: "node2",
            type: "FlowScrapeNode",
            data: {
                type: "IG_SEND_MSG",
                inputs: {},
                igReplyData: {
                    publicReplies: [
                        "Thank you for your interest! Check your DM 📩",
                        "Hi! I've sent you the details via message 💌"
                    ],
                    dmMessage: "Here's the information you requested about our products.",
                    buttons: [{
                        title: "Visit Our Store",
                        url: "https://store.example.com",
                        enabled: true
                    }]
                }
            },
            position: { x: 400, y: 100 }
        }
    ],
    edges: [{
        source: "node1",
        target: "node2",
        animated: true
    }]
};