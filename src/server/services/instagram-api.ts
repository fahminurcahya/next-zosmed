// server/services/instagram-api.ts
import axios from 'axios';

export class InstagramAPI {
    private baseUrl = 'https://graph.instagram.com';
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    async replyToComment(commentId: string, message: string) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${commentId}/replies`,
                {
                    message: message,
                    access_token: this.accessToken
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Instagram API error (comment reply):', error.response?.data);
            throw new Error(error.response?.data?.error?.message || 'Failed to reply to comment');
        }
    }

    async sendDirectMessage(recipientId: string, message: any) {
        try {
            // For Instagram messaging, we need to use the Messenger API
            // First, get the page-scoped user ID (PSID)
            const psidResponse = await axios.get(
                `${this.baseUrl}/me`,
                {
                    params: {
                        fields: 'id',
                        access_token: this.accessToken
                    }
                }
            );

            const pageId = psidResponse.data.id;

            // Send message via Messenger Send API
            const response = await axios.post(
                `${this.baseUrl}/${pageId}/messages`,
                {
                    recipient: { id: recipientId },
                    message: message,
                    messaging_type: 'RESPONSE',
                    access_token: this.accessToken
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Instagram API error (DM):', error.response?.data);
            throw new Error(error.response?.data?.error?.message || 'Failed to send direct message');
        }
    }

    async getUserProfile(userId: string) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${userId}`,
                {
                    params: {
                        fields: 'username,profile_picture_url',
                        access_token: this.accessToken
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Instagram API error (user profile):', error.response?.data);
            return null;
        }
    }

    async getCommentDetails(commentId: string) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${commentId}`,
                {
                    params: {
                        fields: 'id,text,from,timestamp,media{id,media_type,media_url}',
                        access_token: this.accessToken
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Instagram API error (comment details):', error.response?.data);
            throw new Error(error.response?.data?.error?.message || 'Failed to get comment details');
        }
    }
}