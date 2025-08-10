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
                mode?: "STATIC" | "AI";    // default: "STATIC" (untuk kompatibilitas)
                publicReplies?: string[];
                dmMessage?: string;
                safetyConfig?: {
                    enabled: boolean,
                    mode: string,
                    combinedLimits: any,
                    actionTypes: any,
                    contentRules: any
                };
                aiConfig?: {
                    systemPrompt?: string;         // persona/guardrail
                    responseTemplate?: string;     // optional templating (e.g. must include {{name}})
                    variables?: Record<string, string>; // inject var (username, product, dsb)
                    language?: string;             // "en", "id", dst
                    tone?: "friendly" | "formal" | "concise" | "enthusiastic";
                    knowledgeBaseIds?: string[];   // RAG/FAQ terpilih
                    memoryKey?: string;            // session memory per user (opsional)
                    tools?: Array<"link_summarizer" | "product_lookup" | "none">;
                    moderation?: {
                        enabled?: boolean;           // default true
                        blocklist?: string[];        // kata yang dihindari
                        maskPII?: boolean;           // redaksi data sensitif
                        minConfidence?: number;      // 0–1, di bawah ini pakai fallback
                        fallbackMessage?: string;    // pesan jika diblokir/low confidence
                    };
                    rateLimit?: { perUserPerMinute?: number };
                    retry?: { attempts?: number; backoffMs?: number };
                };
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

// Example workflow definition

// ===== 0) Start from Scratch — Comments =====
export const scratchCommentDefinition: WorkflowDefinition = {
    nodes: [
        {
            id: "n-trigger",
            type: "FlowScrapeNode",
            data: {
                type: "IG_COMMENT_RECEIVED",
                inputs: {},
                igUserCommentData: {
                    selectedPostId: [],       // let user pick posts later
                    includeKeywords: [],      // let user add later
                    excludeKeywords: []
                }
            },
            position: { x: 100, y: 100 }
        }
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
};

// ===== 0b) Start from Scratch — DMs =====
export const scratchDMDefinition: WorkflowDefinition = {
    nodes: [
        {
            id: "n-trigger",
            type: "FlowScrapeNode",
            data: {
                type: "IG_DM_RECEIVED",
                inputs: {}
                // You can add a reply node later and connect it
            },
            position: { x: 100, y: 100 }
        }
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
};


// ===== 1) Basic Auto Reply (your safe example, unchanged) =====
export const basicAutoReplyTemplate: WorkflowDefinition = {
    nodes: [
        {
            id: "lead-trigger",
            type: "FlowScrapeNode",
            data: {
                type: "IG_COMMENT_RECEIVED",
                inputs: {},
                igUserCommentData: {
                    selectedPostId: [],
                    includeKeywords: ["info", "price"],
                    excludeKeywords: ["spam"]
                }
            },
            position: { x: 100, y: 100 }
        },
        {
            id: "lead-reply",
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
                    buttons: [
                        { title: "Visit Our Store", url: "https://store.example.com", enabled: true }
                    ],
                    safetyConfig: {
                        enabled: true,
                        mode: "balanced",
                        combinedLimits: {
                            maxActionsPerHour: 25,
                            maxActionsPerDay: 200,
                            delayBetweenActions: [5, 15],
                            commentToDmDelay: [8, 25]
                        },
                        actionTypes: {
                            enableCommentReply: true,
                            enableDMReply: true
                        },
                        contentRules: {
                            maxMentions: 1,
                            maxHashtags: 2
                        }
                    }
                }
            },
            position: { x: 400, y: 100 }
        }
    ],
    edges: [{ source: "lead-trigger", target: "lead-reply", animated: true }],
    viewport: { x: 0, y: 0, zoom: 1 }
};

// ===== 2) Smart Sales Funnel (PRO) =====
// Filters comment leads → sends tailored DM with CTA buttons.
export const smartSalesFunnelTemplate: WorkflowDefinition = {
    nodes: [
        {
            id: "lead-trigger",
            type: "FlowScrapeNode",
            data: {
                type: "IG_COMMENT_RECEIVED",
                inputs: {},
                igUserCommentData: {
                    selectedPostId: [],
                    includeKeywords: ["price", "buy", "how much", "dm me"],
                    excludeKeywords: ["giveaway", "spam"]
                }
            },
            position: { x: 100, y: 80 }
        },
        {
            id: "lead-reply",
            type: "FlowScrapeNode",
            data: {
                type: "IG_SEND_MSG",
                inputs: {},
                igReplyData: {
                    publicReplies: [
                        "Thanks! I’ll DM you details right away ✅"
                    ],
                    dmMessage:
                        "Hey! Here are the options:\n\n• Starter Pack – best for trying it out\n• Pro Pack – most popular\n\nTap a button below to continue.",
                    buttons: [
                        { title: "View Starter", url: "https://store.example.com/starter", enabled: true },
                        { title: "View Pro", url: "https://store.example.com/pro", enabled: true }
                    ],
                    safetyOverride: {
                        customDelay: 3 // quick but still not instant
                    }
                }
            },
            position: { x: 420, y: 80 }
        }
    ],
    edges: [{ source: "lead-trigger", target: "lead-reply", animated: true }],
    viewport: { x: 0, y: 0, zoom: 1 }
};

// ===== 3) Community Welcome =====
// Welcomes any friendly comment and invites to the community link.
export const communityWelcomeTemplate: WorkflowDefinition = {
    nodes: [
        {
            id: "welcome-trigger",
            type: "FlowScrapeNode",
            data: {
                type: "IG_COMMENT_RECEIVED",
                inputs: {},
                igUserCommentData: {
                    selectedPostId: [], // default to all posts / user will pick
                    includeKeywords: ["hi", "hello", "nice", "love", "great"],
                    excludeKeywords: ["support", "complain", "spam"]
                }
            },
            position: { x: 100, y: 120 }
        },
        {
            id: "welcome-reply",
            type: "FlowScrapeNode",
            data: {
                type: "IG_SEND_MSG",
                inputs: {},
                igReplyData: {
                    publicReplies: [
                        "Thanks for the love! 💜",
                        "Appreciate your comment! 🙌"
                    ],
                    dmMessage:
                        "Welcome to the community! Here’s a quick guide and a link to join our group.",
                    buttons: [
                        { title: "Join Community", url: "https://community.example.com", enabled: true }
                    ],
                    safetyOverride: {
                        customDelay: 8 // slower, friendly pace
                    }
                }
            },
            position: { x: 420, y: 120 }
        }
    ],
    edges: [{ source: "welcome-trigger", target: "welcome-reply", animated: true }],
    viewport: { x: 0, y: 0, zoom: 1 }
};

// ===== 1) Auto Response (DM) =====
export const autoResponseDMTemplate: WorkflowDefinition = {
    nodes: [
        {
            id: "trigger-dm",
            type: "FlowScrapeNode",
            data: {
                type: "IG_DM_RECEIVED",
                inputs: {}
            },
            position: { x: 100, y: 100 }
        },
        {
            id: "reply-dm",
            type: "FlowScrapeNode",
            data: {
                type: "IG_SEND_MSG",
                inputs: {},
                igReplyData: {
                    dmMessage: "Hi there! Thanks for messaging us. How can I help you today? 😊",
                    buttons: [
                        { title: "View Products", url: "https://store.example.com", enabled: true },
                        { title: "Contact Support", url: "https://support.example.com", enabled: true }
                    ]
                }
            },
            position: { x: 400, y: 100 }
        }
    ],
    edges: [{ source: "trigger-dm", target: "reply-dm", animated: true }],
    viewport: { x: 0, y: 0, zoom: 1 }
};

// ===== 2) Support Bot (DM, PRO) =====
export const supportBotDMTemplate: WorkflowDefinition = {
    nodes: [
        {
            id: "trigger-dm",
            type: "FlowScrapeNode",
            data: {
                type: "IG_DM_RECEIVED",
                inputs: {}
            },
            position: { x: 100, y: 80 }
        },
        {
            id: "ai-reply-dm",
            type: "FlowScrapeNode",
            data: {
                type: "IG_SEND_MSG",
                inputs: {},
                igReplyData: {
                    dmMessage:
                        "👋 Hi! I’m your support assistant. Please tell me your question, and I’ll do my best to help.",
                    buttons: [
                        { title: "FAQ", url: "https://example.com/faq", enabled: true },
                        { title: "Live Chat", url: "https://example.com/livechat", enabled: true }
                    ],
                    safetyOverride: {
                        skipDelay: true // instant AI feel
                    }
                }
            },
            position: { x: 420, y: 80 }
        }
    ],
    edges: [{ source: "trigger-dm", target: "ai-reply-dm", animated: true }],
    viewport: { x: 0, y: 0, zoom: 1 }
};