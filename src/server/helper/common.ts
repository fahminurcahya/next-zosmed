// Helper functions
export function generateDiscountCode(email: string): string {
    const hash = (email.split("@")[0] || email).toUpperCase().slice(0, 4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EARLY${hash}${random}`;
}