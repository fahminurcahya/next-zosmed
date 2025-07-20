import type { BusinessCategory, BusinessSize } from "@prisma/client";

function mapBusinessCategoryToPrisma(category: string): BusinessCategory {
    const mapping: Record<string, BusinessCategory> = {
        'fb': 'FB',
        'fashion': 'FASHION',
        'education': 'EDUCATION',
        'health': 'HEALTH',
        'technology': 'TECHNOLOGY',
        'retail': 'RETAIL',
        'other': 'OTHER',
    };
    return mapping[category.toLowerCase()] || 'OTHER';
}

function mapBusinessSizeToPrisma(size: string): BusinessSize {
    const mapping: Record<string, BusinessSize> = {
        'solo': 'SOLO',
        'small': 'SMALL',
        'medium': 'MEDIUM',
        'large': 'LARGE',
    };
    return mapping[size.toLowerCase()] || 'SOLO';
}

// Helper function to map Prisma enum to frontend enum
function mapBusinessCategoryFromPrisma(category: BusinessCategory): string {
    const mapping: Record<BusinessCategory, string> = {
        'FB': 'fb',
        'FASHION': 'fashion',
        'EDUCATION': 'education',
        'HEALTH': 'health',
        'TECHNOLOGY': 'technology',
        'RETAIL': 'retail',
        'OTHER': 'other',
    };
    return mapping[category] || 'other';
}

function mapBusinessSizeFromPrisma(size: BusinessSize): string {
    const mapping: Record<BusinessSize, string> = {
        'SOLO': 'solo',
        'SMALL': 'small',
        'MEDIUM': 'medium',
        'LARGE': 'large',
    };
    return mapping[size] || 'solo';
}

export {
    mapBusinessCategoryToPrisma,
    mapBusinessSizeToPrisma,
    mapBusinessCategoryFromPrisma,
    mapBusinessSizeFromPrisma,
};