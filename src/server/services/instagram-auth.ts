import { TRPCError } from "@trpc/server";
import axios, { AxiosError } from "axios";
import crypto from "crypto";

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
}

interface UserProfile {
    id: string;
    username: string;
    account_type: string;
    media_count: number;
    followers_count?: number;
    follows_count?: number;
    profile_picture_url?: string;
    biography?: string;
    website?: string;
    name?: string;
}

interface InstagramError {
    error: {
        message: string;
        type: string;
        code: number;
        error_subcode?: number;
        fbtrace_id?: string;
    };
}

// Enhanced error handling
class InstagramAPIError extends Error {
    constructor(
        message: string,
        public code: string = 'INTERNAL_SERVER_ERROR',
        public originalError?: any
    ) {
        super(message);
        this.name = 'InstagramAPIError';
    }
}

export const InstagramAuthService = {
    // Constants
    TOKEN_EXPIRY_BUFFER: 7 * 24 * 60 * 60 * 1000, // 7 days buffer before expiry
    STATE_EXPIRY: 10 * 60 * 1000, // 10 minutes

    // Required scopes for MVP
    REQUIRED_SCOPES: [
        'instagram_business_basic',
        'instagram_business_manage_messages',
        'instagram_business_manage_comments',
        'instagram_business_content_publish',
        'instagram_business_manage_insights',
    ],

    // Generate secure state with HMAC
    generateSecureState: (userId: string): string => {
        const data = {
            userId,
            timestamp: Date.now(),
            nonce: crypto.randomBytes(16).toString('hex')
        };

        const payload = Buffer.from(JSON.stringify(data)).toString('base64');
        const signature = crypto
            .createHmac('sha256', process.env.INSTAGRAM_STATE_SECRET || 'fallback-secret')
            .update(payload)
            .digest('hex');

        return `${payload}.${signature}`;
    },

    // Validate state with HMAC verification
    validateState: (state: string, userId: string): boolean => {
        try {
            const [payload, signature] = state.split('.');

            // Verify signature
            const expectedSignature = crypto
                .createHmac('sha256', process.env.INSTAGRAM_STATE_SECRET || 'fallback-secret')
                .update(payload!)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error('State signature mismatch');
                return false;
            }

            // Decode and validate payload
            const decoded = JSON.parse(Buffer.from(payload!, 'base64').toString());
            const isExpired = Date.now() - decoded.timestamp > InstagramAuthService.STATE_EXPIRY;

            return decoded.userId === userId && !isExpired;
        } catch (error) {
            console.error('State validation error:', error);
            return false;
        }
    },

    // Generate OAuth URL with all required permissions
    getAuthorizationUrl: (userId: string, businessAccount: boolean = true): string => {
        const state = InstagramAuthService.generateSecureState(userId);

        // Different scopes based on account type
        const scopes = InstagramAuthService.REQUIRED_SCOPES.join(',')

        const params = new URLSearchParams({
            client_id: process.env.INSTAGRAM_APP_ID!,
            redirect_uri: InstagramAuthService.getRedirectUri(),
            scope: scopes,
            response_type: 'code',
            state,
        });

        // Add display parameter for better mobile experience
        if (InstagramAuthService.isMobileUserAgent()) {
            params.append('display', 'touch');
        }

        const authUrl = `${process.env.INSTAGRAM_API_BASE_URL || 'https://api.instagram.com'}/oauth/authorize?force_reauth=true&${params.toString()}`;

        console.log('Generated auth URL:', authUrl);
        return authUrl;
    },

    // Exchange authorization code for access token with retry logic
    exchangeCodeForToken: async (code: string): Promise<TokenResponse> => {
        const maxRetries = 3;
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await axios.post(
                    `${process.env.INSTAGRAM_API_BASE_URL || 'https://api.instagram.com'}/oauth/access_token`,
                    new URLSearchParams({
                        client_id: process.env.INSTAGRAM_APP_ID!,
                        client_secret: process.env.INSTAGRAM_APP_SECRET!,
                        grant_type: 'authorization_code',
                        redirect_uri: InstagramAuthService.getRedirectUri(),
                        code,
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        timeout: 30000, // 30 seconds timeout
                    }
                );

                // Log successful exchange
                console.log(`Token exchange successful on attempt ${attempt}`);

                return {
                    ...response.data,
                    scope: response.data.scope || InstagramAuthService.REQUIRED_SCOPES.join(',')
                };
            } catch (error) {
                lastError = error;
                console.error(`Token exchange attempt ${attempt} failed:`, error);

                if (attempt < maxRetries) {
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        // Parse and throw appropriate error
        throw InstagramAuthService.parseInstagramError(lastError, 'Failed to authenticate with Instagram');
    },

    // Get extended user profile information
    getUserProfile: async (accessToken: string): Promise<UserProfile> => {
        try {
            const fields = [
                'id',
                'username',
                'account_type',
                'media_count',
                'followers_count',
                'follows_count',
                'name',
                'biography',
                'website',
                'profile_picture_url'
            ].join(',');

            const response = await axios.get(
                `${process.env.INSTAGRAM_GRAPH_URL || 'https://graph.instagram.com'}/me`,
                {
                    params: {
                        fields,
                        access_token: accessToken,
                    },
                    timeout: 15000,
                }
            );

            // Validate required fields
            if (!response.data.id || !response.data.username) {
                throw new InstagramAPIError('Invalid profile data received', 'INVALID_RESPONSE');
            }

            return response.data;
        } catch (error) {
            throw InstagramAuthService.parseInstagramError(error, 'Failed to fetch Instagram profile');
        }
    },

    // Exchange short-lived token for long-lived token with validation
    getLongLivedToken: async (accessToken: string): Promise<TokenResponse> => {
        try {
            const response = await axios.get(
                `${process.env.INSTAGRAM_GRAPH_URL || 'https://graph.instagram.com'}/access_token`,
                {
                    params: {
                        grant_type: 'ig_exchange_token',
                        client_secret: process.env.INSTAGRAM_APP_SECRET!,
                        access_token: accessToken,
                    },
                    timeout: 20000,
                }
            );

            const tokenData = response.data;

            // Validate token response
            if (!tokenData.access_token) {
                throw new InstagramAPIError('No access token in response', 'INVALID_RESPONSE');
            }

            // Calculate actual expiry time
            const expiresIn = tokenData.expires_in || 5184000; // Default 60 days

            console.log(`Long-lived token obtained, expires in ${expiresIn} seconds`);

            return {
                ...tokenData,
                expires_in: expiresIn,
            };
        } catch (error) {
            console.error('Error getting long-lived token:', error);

            // If exchange fails, return original token
            // This allows the flow to continue with short-lived token
            return {
                access_token: accessToken,
                token_type: 'bearer',
                expires_in: 3600 // 1 hour for short-lived token
            };
        }
    },

    // Refresh long-lived token before expiry
    refreshLongLivedToken: async (accessToken: string): Promise<TokenResponse> => {
        try {
            const response = await axios.get(
                `${process.env.INSTAGRAM_GRAPH_URL || 'https://graph.instagram.com'}/refresh_access_token`,
                {
                    params: {
                        grant_type: 'ig_refresh_token',
                        access_token: accessToken,
                    },
                    timeout: 20000,
                }
            );

            console.log('Token refreshed successfully');
            return response.data;
        } catch (error) {
            throw InstagramAuthService.parseInstagramError(error, 'Failed to refresh Instagram token');
        }
    },

    // Validate token and check permissions
    validateToken: async (accessToken: string): Promise<{
        isValid: boolean;
        scopes: string[];
        expiresAt?: Date;
        userId?: string;
    }> => {
        try {
            const response = await axios.get(
                `${process.env.INSTAGRAM_GRAPH_URL || 'https://graph.instagram.com'}/debug_token`,
                {
                    params: {
                        input_token: accessToken,
                        access_token: `${process.env.INSTAGRAM_APP_ID}|${process.env.INSTAGRAM_APP_SECRET}`,
                    },
                }
            );

            const { data } = response.data;

            return {
                isValid: data.is_valid,
                scopes: data.scopes || [],
                expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined,
                userId: data.user_id,
            };
        } catch (error) {
            console.error('Token validation failed:', error);
            return { isValid: false, scopes: [] };
        }
    },

    // Revoke Instagram permissions
    revokeInstagramToken: async (accessToken: string): Promise<boolean> => {
        try {
            // Try multiple revocation methods
            const revocationPromises = [
                // Method 1: Delete permissions via Graph API
                axios.delete(
                    `${process.env.INSTAGRAM_GRAPH_URL || 'https://graph.facebook.com'}/me/permissions`,
                    { params: { access_token: accessToken } }
                ).catch(e => console.error('Permission deletion failed:', e)),

                // Method 2: Deauthorize app
                axios.post(
                    `${process.env.INSTAGRAM_API_BASE_URL || 'https://api.instagram.com'}/oauth/revoke`,
                    new URLSearchParams({
                        token: accessToken,
                        client_id: process.env.INSTAGRAM_APP_ID!,
                        client_secret: process.env.INSTAGRAM_APP_SECRET!,
                    }),
                    {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    }
                ).catch(e => console.error('Token revocation failed:', e))
            ];

            await Promise.allSettled(revocationPromises);
            console.log('Instagram token revoked successfully');
            return true;
        } catch (error) {
            console.error('Failed to revoke token:', error);
            return false;
        }
    },

    // Helper: Get appropriate redirect URI
    getRedirectUri: (): string => {
        if (process.env.INSTAGRAM_REDIRECT_URI) {
            return process.env.INSTAGRAM_REDIRECT_URI;
        }

        // Fallback based on environment
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000'
                : 'https://yourdomain.com'); //todo for development

        return `${baseUrl}/api/instagram/callback`;
    },

    // Helper: Check if request is from mobile
    isMobileUserAgent: (): boolean => {
        if (typeof window !== 'undefined' && window.navigator) {
            return /Mobile|Android|iPhone/i.test(window.navigator.userAgent);
        }
        return false;
    },

    // Helper: Parse Instagram API errors
    parseInstagramError: (error: any, defaultMessage: string): InstagramAPIError => {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<InstagramError>;

            if (axiosError.response?.data?.error) {
                const igError = axiosError.response.data.error;

                // Map Instagram error codes to TRPC codes
                let code = 'INTERNAL_SERVER_ERROR';
                let message = igError.message || defaultMessage;

                switch (igError.code) {
                    case 190: // Invalid OAuth token
                    case 102: // Session invalid
                        code = 'UNAUTHORIZED';
                        message = 'Instagram session expired. Please reconnect your account.';
                        break;
                    case 10: // Permission denied
                    case 200: // Permission error
                        code = 'FORBIDDEN';
                        message = 'Missing required Instagram permissions. Please reconnect with all permissions.';
                        break;
                    case 4: // Rate limit
                    case 17: // User request limit reached
                        code = 'TOO_MANY_REQUESTS';
                        message = 'Instagram rate limit reached. Please try again later.';
                        break;
                    case 100: // Invalid parameter
                        code = 'BAD_REQUEST';
                        break;
                }

                return new InstagramAPIError(message, code, igError);
            }

            // Network errors
            if (axiosError.code === 'ECONNABORTED') {
                return new InstagramAPIError('Instagram request timed out', 'TIMEOUT', error);
            }

            if (axiosError.code === 'ENETUNREACH' || axiosError.code === 'ENOTFOUND') {
                return new InstagramAPIError('Cannot connect to Instagram', 'PRECONDITION_FAILED', error);
            }
        }

        return new InstagramAPIError(defaultMessage, 'INTERNAL_SERVER_ERROR', error);
    },

    // Check if token needs refresh (with buffer time)
    shouldRefreshToken: (expiresAt: Date): boolean => {
        const now = Date.now();
        const expiryTime = expiresAt.getTime();
        return (expiryTime - now) < InstagramAuthService.TOKEN_EXPIRY_BUFFER;
    },

    // Batch validate multiple tokens
    validateMultipleTokens: async (tokens: Array<{ id: string; accessToken: string }>) => {
        const validations = await Promise.allSettled(
            tokens.map(async ({ id, accessToken }) => {
                const result = await InstagramAuthService.validateToken(accessToken);
                return { id, ...result };
            })
        );

        return validations
            .filter((v): v is PromiseFulfilledResult<any> => v.status === 'fulfilled')
            .map(v => v.value);
    },
};