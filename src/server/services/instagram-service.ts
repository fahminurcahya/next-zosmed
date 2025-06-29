import axios from "axios";

export class InstagramService {
    async replyToComment(
        commentId: string,
        message: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `https://graph.facebook.com/v18.0/${commentId}/replies`,
                {
                    message,
                },
                {
                    params: {
                        access_token: accessToken,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error replying to comment:", error);
            throw error;
        }
    }

    async sendDirectMessage(
        recipientId: string,
        message: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `https://graph.facebook.com/v18.0/me/messages`,
                {
                    recipient: { id: recipientId },
                    message: { text: message },
                },
                {
                    params: {
                        access_token: accessToken,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error sending DM:", error);
            throw error;
        }
    }

    async getCommentDetails(commentId: string, accessToken: string) {
        try {
            const response = await axios.get(
                `https://graph.facebook.com/v18.0/${commentId}`,
                {
                    params: {
                        fields: "id,text,from,media",
                        access_token: accessToken,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching comment details:", error);
            throw error;
        }
    }
}