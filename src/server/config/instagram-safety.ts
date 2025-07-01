export const InstagramSafetyConfig = {
    // Rate limits to prevent ban
    rateLimits: {
        // Comments
        commentsPerHour: 25,        // Max 25 comment replies per hour
        commentsPerDay: 200,        // Max 200 comment replies per day

        // Direct Messages
        dmsPerHour: 20,            // Max 20 DMs per hour
        dmsPerDay: 100,            // Max 100 DMs per day

        // API Calls
        apiCallsPerHour: 200,      // Max 200 API calls per hour

        // Delays between actions (in milliseconds)
        minDelayBetweenActions: 5000,    // 5 seconds minimum
        maxDelayBetweenActions: 15000,   // 15 seconds maximum

        // Cool down periods
        cooldownAfterBurst: 30 * 60 * 1000,  // 30 minutes cooldown after burst
        burstThreshold: 10,                   // Actions before cooldown
    },

    // Content safety
    contentRules: {
        // Banned words/phrases that might trigger spam detection
        bannedPhrases: [
            'click link',
            'dm for info',
            'check bio',
            'follow back',
            'f4f',
            'l4l',
            'buy now',
            'limited offer',
            'act now',
            'earn money',
            'work from home'
        ],

        // Max mentions per message
        maxMentionsPerMessage: 1,

        // Max hashtags per message
        maxHashtagsPerMessage: 2,

        // Max URLs per message
        maxUrlsPerMessage: 1,

        // Min message variation (to avoid spam detection)
        minMessageVariation: 0.3, // 30% of words should be different
    },

    // Account safety
    accountSafety: {
        // Minimum account age before automation (in days)
        minAccountAge: 7,

        // Warm-up period for new connections
        warmupPeriod: {
            days: 3,
            maxActionsPerDay: 10,
        },

        // Activity patterns to appear human-like
        activityPatterns: {
            // Active hours (in user's timezone)
            activeHours: { start: 9, end: 22 }, // 9 AM to 10 PM

            // Random pause between batches
            pauseBetweenBatches: {
                min: 15 * 60 * 1000,  // 15 minutes
                max: 45 * 60 * 1000,  // 45 minutes
            },

            // Max consecutive actions
            maxConsecutiveActions: 5,
        },
    },

    // Message templates for safety
    messageTemplates: {
        // Vary these templates to avoid detection
        commentReplies: [
            "Thanks for your interest! I've sent you more details 💌",
            "Appreciate your comment! Check your messages for info 📩",
            "Thank you! I've messaged you with the details ✨",
            "Hi there! Just sent you the information via DM 💬",
            "Thanks for reaching out! Details are in your inbox 📮",
        ],

        // DM templates with personalization
        dmTemplates: [
            "Hi {username}! Thanks for your interest in my post. Here's the information you requested:",
            "Hey {username}! I saw your comment and wanted to share more details with you:",
            "Hello {username}! Thank you for engaging with my content. Here's what you asked about:",
        ],
    },
};

// Helper functions for safety checks
export class InstagramSafetyChecker {
    static isMessageSafe(message: string): { safe: boolean; reason?: string } {
        const lowerMessage = message.toLowerCase();

        // Check banned phrases
        for (const phrase of InstagramSafetyConfig.contentRules.bannedPhrases) {
            if (lowerMessage.includes(phrase)) {
                return { safe: false, reason: `Contains banned phrase: ${phrase}` };
            }
        }

        // Check mentions
        const mentions = (message.match(/@[\w.]+/g) || []).length;
        if (mentions > InstagramSafetyConfig.contentRules.maxMentionsPerMessage) {
            return { safe: false, reason: 'Too many mentions' };
        }

        // Check hashtags
        const hashtags = (message.match(/#[\w]+/g) || []).length;
        if (hashtags > InstagramSafetyConfig.contentRules.maxHashtagsPerMessage) {
            return { safe: false, reason: 'Too many hashtags' };
        }

        // Check URLs
        const urls = (message.match(/https?:\/\/[^\s]+/g) || []).length;
        if (urls > InstagramSafetyConfig.contentRules.maxUrlsPerMessage) {
            return { safe: false, reason: 'Too many URLs' };
        }

        return { safe: true };
    }

    static calculateMessageSimilarity(msg1: string, msg2: string): number {
        const words1 = msg1.toLowerCase().split(/\s+/);
        const words2 = msg2.toLowerCase().split(/\s+/);
        const set1 = new Set(words1);
        const set2 = new Set(words2);

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    static getRandomDelay(): number {
        const min = InstagramSafetyConfig.rateLimits.minDelayBetweenActions;
        const max = InstagramSafetyConfig.rateLimits.maxDelayBetweenActions;
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static isWithinActiveHours(): boolean {
        const now = new Date();
        const hour = now.getHours();
        const { start, end } = InstagramSafetyConfig.accountSafety.activityPatterns.activeHours;
        return hour >= start && hour < end;
    }

    static async shouldPauseForSafety(actionCount: number): Promise<boolean> {
        // Pause after burst of actions
        if (actionCount % InstagramSafetyConfig.rateLimits.burstThreshold === 0) {
            return true;
        }

        // Pause if outside active hours
        if (!this.isWithinActiveHours()) {
            return true;
        }

        return false;
    }

    static getRandomTemplate(templates: string[]): string {
        return templates[Math.floor(Math.random() * templates.length)]!;
    }

    static personalizeMessage(template: string, data: Record<string, string>): string {
        let message = template;
        Object.entries(data).forEach(([key, value]) => {
            message = message.replace(`{${key}}`, value);
        });
        return message;
    }
}