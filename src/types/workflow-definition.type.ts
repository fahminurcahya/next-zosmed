// types/workflow-definition.ts

export interface WorkflowDefinition {
    // Safety configuration (NEW)
    safetySettings?: {
        enabled: boolean;                    // Master switch for safety features
        useRecommendedLimits?: boolean;      // Use Instagram best practice limits
        customLimits?: {
            commentsPerHour?: number;          // Custom comment limit per hour
            commentsPerDay?: number;           // Custom comment limit per day
            dmsPerHour?: number;               // Custom DM limit per hour
            dmsPerDay?: number;                // Custom DM limit per day
        };
        delays?: {
            enabled: boolean;                  // Enable human-like delays
            minDelay?: number;                 // Min delay in ms (default 5000)
            maxDelay?: number;                 // Max delay in ms (default 15000)
            betweenCommentAndDm?: number;      // Delay between comment reply and DM
        };
        contentSafety?: {
            enabled: boolean;                  // Enable content filtering
            checkBannedPhrases?: boolean;      // Check for spam phrases
            maxMentions?: number;              // Max @ mentions allowed
            maxHashtags?: number;              // Max # hashtags allowed
            maxUrls?: number;                  // Max URLs allowed
        };
        activeHours?: {
            enabled: boolean;                  // Limit to active hours
            startHour?: number;                // Start hour (0-23)
            endHour?: number;                  // End hour (0-23)
            timezone?: string;                 // Timezone (default: user's timezone)
        };
        warmupMode?: {
            enabled: boolean;                  // Enable warmup for new accounts
            days?: number;                     // Warmup period in days
            actionsPerDay?: number;            // Max actions during warmup
        };
    };


    // Existing fields
    nodes: Array<{
        id: string;
        type: string;
        data: {
            type: string;
            inputs: any;
            igUserCommentData?: {
                selectedPostId: string;
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
    safetySettings: {
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
            endHour: 22,
            timezone: "Asia/Jakarta"
        }
    },
    nodes: [
        {
            id: "node1",
            type: "FlowScrapeNode",
            data: {
                type: "IG_USER_COMMENT",
                inputs: {},
                igUserCommentData: {
                    selectedPostId: "1",
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

// 2. AGGRESSIVE MODE - No safety limits (risky)
export const aggressiveWorkflowExample: WorkflowDefinition = {
    safetySettings: {
        enabled: false  // Disable all safety features
    },
    nodes: [
        // Same nodes as above
    ],
    edges: [
        // Same edges as above
    ]
};

// 3. CUSTOM MODE - Custom safety settings
export const customWorkflowExample: WorkflowDefinition = {
    safetySettings: {
        enabled: true,
        useRecommendedLimits: false,
        customLimits: {
            commentsPerHour: 50,    // Higher than recommended
            commentsPerDay: 400,
            dmsPerHour: 30,
            dmsPerDay: 200
        },
        delays: {
            enabled: true,
            minDelay: 2000,         // Faster delays
            maxDelay: 5000
        },
        contentSafety: {
            enabled: false          // No content filtering
        },
        activeHours: {
            enabled: false          // Work 24/7
        }
    },
    nodes: [
        // Nodes configuration
    ],
    edges: [
        // Edges configuration
    ]
};