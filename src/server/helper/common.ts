// Helper functions
export function generateDiscountCode(email: string): string {
    const hash = (email.split("@")[0] || email).toUpperCase().slice(0, 4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EARLY${hash}${random}`;
}

export function replaceCallbackURL(originalUrl: string, newCallbackURL: string) {
    try {
        const url = new URL(originalUrl);
        url.searchParams.set('callbackURL', newCallbackURL);
        return url.toString();
    } catch (error) {
        console.error("Invalid URL provided:", error);
        return originalUrl; // Return original URL if parsing fails
    }
}

export function getLast30Days() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return last30Days;
}

