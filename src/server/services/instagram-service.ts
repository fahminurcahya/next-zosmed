import axios from "axios";

const IG_VERSION = "v23.0"
const BASE_URL = process.env.INSTAGRAM_GRAPH_URL || "https://graph.instagram.com";

export class InstagramService {

    async replyToComment(
        instagramUserId: string,
        commentId: string,
        message: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/messages`,
                {
                    recipient: {
                        comment_id: commentId
                    },
                    message: {
                        text: message
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error replying to comment:", error);
            throw error;
        }
    }

    async sendDirectMessage(
        instagramUserId: string,
        recipientId: string,
        message: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/messages`,
                {
                    recipient: {
                        id: recipientId
                    },
                    message: {
                        text: message
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error sending DM:", error);
            throw error;
        }
    }

    async getCommentDetails(commentId: string, accessToken: string) {
        try {
            const response = await axios.get(
                `${BASE_URL}/${IG_VERSION}/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        fields: "id,text,username,timestamp,like_count,replies{id,text,username,timestamp}",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching comment details:", error);
            throw error;
        }
    }

    async getAllPosts(instagramUserId: string, accessToken: string) {
        try {
            const response = await axios.get(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/media`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        fields: "id,caption,media_type,media_url,permalink,timestamp,username,like_count,comments_count",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching posts:", error);
            throw error;
        }
    }

    async getPostDetails(postId: string, accessToken: string) {
        try {
            const response = await axios.get(
                `${BASE_URL}/${IG_VERSION}/${postId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        fields: "id,caption,media_type,media_url,permalink,timestamp,username,like_count,comments_count",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching post details:", error);
            throw error;
        }
    }

    async getPostComments(postId: string, accessToken: string) {
        try {
            const response = await axios.get(
                `${BASE_URL}/${IG_VERSION}/${postId}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        fields: "id,text,username,timestamp,like_count,replies{id,text,username,timestamp}",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching post comments:", error);
            throw error;
        }
    }

    async sendMediaMessage(
        instagramUserId: string,
        recipientId: string,
        mediaUrl: string,
        mediaType: 'image' | 'video' | 'audio',
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/messages`,
                {
                    recipient: {
                        id: recipientId
                    },
                    message: {
                        attachment: {
                            type: mediaType,
                            payload: {
                                url: mediaUrl,
                            },
                        },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error sending media message:", error);
            throw error;
        }
    }

    async sendHeartSticker(
        instagramUserId: string,
        recipientId: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/messages`,
                {
                    recipient: {
                        id: recipientId
                    },
                    message: {
                        attachment: {
                            type: "like_heart",
                        },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error sending heart sticker:", error);
            throw error;
        }
    }


    async sharePostInMessage(
        instagramUserId: string,
        recipientId: string,
        postId: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/messages`,
                {
                    recipient: {
                        id: recipientId
                    },
                    message: {
                        attachment: {
                            type: "MEDIA_SHARE",
                            payload: {
                                id: postId,
                            },
                        },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error sharing post:", error);
            throw error;
        }
    }

    async getUserProfile(instagramUserId: string, accessToken: string) {
        try {
            const response = await axios.get(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        fields: "id,username,account_type,media_count,followers_count,follows_count",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching user profile:", error);
            throw error;
        }
    }

    async sendReaction(
        instagramUserId: string,
        recipientId: string,
        messageId: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/messages`,
                {
                    recipient: {
                        id: recipientId
                    },
                    sender_action: "react",
                    payload: {
                        message_id: messageId,
                        reaction: "love",
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error sending reaction:", error);
            throw error;
        }
    }

    async removeReaction(
        instagramUserId: string,
        recipientId: string,
        messageId: string,
        accessToken: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${IG_VERSION}/${instagramUserId}/messages`,
                {
                    recipient: {
                        id: recipientId
                    },
                    sender_action: "unreact",
                    payload: {
                        message_id: messageId,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Error removing reaction:", error);
            throw error;
        }
    }
}
