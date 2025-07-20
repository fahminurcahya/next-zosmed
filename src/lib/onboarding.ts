import { businessInfoValidationSchema } from "@/schema/onboarding.schema";
import type { BusinessInfoFormData, FormErrors } from "@/types/onboarding.type";
import { z } from "zod";

export function validateBusinessInfo(data: BusinessInfoFormData): {
    isValid: boolean;
    errors: FormErrors;
} {
    try {
        businessInfoValidationSchema.parse(data);
        return { isValid: true, errors: {} };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: FormErrors = {};
            error.errors.forEach(err => {
                if (err.path[0]) {
                    errors[err.path[0].toString()] = err.message;
                }
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { general: 'Validation failed' } };
    }
}

