
// Invoice Types
export interface XenditInvoice {
    id: string;
    externalId: string;
    userId: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
    merchantName: string;
    amount: number;
    paidAmount?: number;
    currency: string;
    description: string;
    invoiceUrl: string;
    expiryDate: string;
    paidAt?: string;
    paymentMethod?: string;
    paymentChannel?: string;
    paymentDetails?: any;
    customer: {
        givenNames: string;
        email: string;
        mobileNumber?: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        category?: string;
        url?: string;
    }>;
    fees?: Array<{
        type: string;
        value: number;
    }>;
    availableBanks?: Array<{
        bankCode: string;
        collectionType: string;
        transferAmount: number;
        bankBranch: string;
        accountHolderName: string;
        identityAmount: number;
    }>;
    availableRetailOutlets?: Array<{
        retailOutletName: string;
        paymentCode: string;
        transferAmount: number;
    }>;
    availableEwallets?: Array<{
        ewalletType: string;
    }>;
    availableQrCodes?: Array<{
        qrCodeType: string;
    }>;
    created: string;
    updated: string;
}

// Payment Method Types
export interface XenditPaymentMethod {
    id: string;
    type: "CARD" | "EWALLET" | "DIRECT_DEBIT" | "OVER_THE_COUNTER" | "QR_CODE" | "VIRTUAL_ACCOUNT";
    status: "ACTIVE" | "INACTIVE" | "PENDING" | "EXPIRED" | "FAILED";
    reusability: "ONE_TIME_USE" | "MULTIPLE_USE";
    country: string;
    businessId: string;
    customerId?: string;
    referenceId?: string;
    description?: string;
    card?: {
        maskedCardNumber: string;
        expiryMonth: string;
        expiryYear: string;
        brand: string;
        type: string;
        issuer: string;
        country: string;
    };
    ewallet?: {
        channelCode: "OVO" | "DANA" | "LINKAJA" | "SHOPEEPAY" | "GCASH" | "GRABPAY" | "PAYMAYA";
        channelProperties: {
            mobileNumber?: string;
            accountId?: string;
        };
    };
    directDebit?: {
        channelCode: string;
        channelProperties: {
            accountNumber?: string;
            accountHolderName?: string;
            debitCard?: {
                mobileNumber?: string;
                cardLastFour?: string;
            };
        };
    };
    overTheCounter?: {
        channelCode: "ALFAMART" | "INDOMARET" | "7ELEVEN";
        channelProperties: {
            paymentCode: string;
            customerName: string;
            expiresAt?: string;
        };
    };
    virtualAccount?: {
        channelCode: "BCA" | "BNI" | "BRI" | "MANDIRI" | "PERMATA" | "BSI" | "BJB" | "SAHABAT_SAMPOERNA" | "CIMB";
        channelProperties: {
            customerName: string;
            virtualAccountNumber: string;
            expiresAt?: string;
        };
    };
    qrCode?: {
        channelCode: "QRIS" | "DANA" | "LINKAJA" | "SHOPEEPAY";
        channelProperties: {
            qrString: string;
            expiresAt?: string;
        };
    };
    metadata?: Record<string, any>;
    created: string;
    updated: string;
}

// Customer Types
export interface XenditCustomer {
    id: string;
    referenceId: string;
    givenNames: string;
    surname?: string;
    email?: string;
    mobileNumber?: string;
    phoneNumber?: string;
    nationality?: string;
    dateOfBirth?: string;
    addresses?: Array<{
        streetLine1?: string;
        streetLine2?: string;
        city?: string;
        province?: string;
        state?: string;
        postalCode?: string;
        country: string;
        category?: string;
        isPrimary?: boolean;
    }>;
    identityAccounts?: Array<{
        type: string;
        company: string;
        description?: string;
        country?: string;
        properties?: Record<string, any>;
    }>;
    businessDetail?: {
        businessName?: string;
        businessType?: string;
        natureOfBusiness?: string;
        businessDomicile?: string;
        dateOfRegistration?: string;
    };
    description?: string;
    metadata?: Record<string, any>;
    created: string;
    updated: string;
}

// Recurring Payment Types
export interface XenditRecurringPlan {
    id: string;
    referenceId: string;
    customerId: string;
    recurringAction: "PAYMENT" | "BINDING";
    recurringCycle?: {
        cycleId: string;
        plannedCycleId: string;
        referenceId: string;
        customerId: string;
        currency: string;
        amount: number;
        status: "PENDING" | "REQUIRES_ACTION" | "PROCESSING" | "SUCCEEDED" | "FAILED";
        reason?: string;
        created: string;
        updated: string;
    };
    schedule: {
        referenceId: string;
        interval: "DAY" | "WEEK" | "MONTH";
        intervalCount: number;
        created: string;
        updated: string;
        totalRecurrence?: number;
        anchorDate?: string;
    };
    immediateActionType?: "FULL_AMOUNT" | "OTHER_AMOUNT";
    notification?: {
        channelName: string[];
        locale?: string;
    };
    failedCycleAction?: "STOP" | "IGNORE";
    paymentMethods?: Array<{
        paymentMethodId: string;
        rank: number;
    }>;
    metadata?: Record<string, any>;
    description?: string;
    currency: string;
    amount: number;
    status: "REQUIRES_ACTION" | "ACTIVE" | "INACTIVE" | "PENDING";
    failureCode?: string;
    created: string;
    updated: string;
    actions?: Array<{
        action: string;
        actionType: string;
        status: string;
        failureCode?: string;
        created: string;
        updated: string;
    }>;
}

// Payout Types
export interface XenditPayout {
    id: string;
    referenceId: string;
    businessId: string;
    channelCode: string;
    channelProperties: {
        accountNumber: string;
        accountHolderName: string;
    };
    amount: number;
    currency: string;
    description: string;
    status: "PENDING" | "ACCEPTED" | "REQUESTED" | "LOCKED" | "FAILED" | "CANCELLED" | "REVERSED" | "SUCCEEDED";
    failureCode?: string;
    estimatedArrivalTime?: string;
    created: string;
    updated: string;
    metadata?: Record<string, any>;
}

// Balance Types
export interface XenditBalance {
    balance: number;
    currency: string;
    updatedAt: string;
}

// Webhook Event Types
export interface XenditWebhookPayload {
    id: string;
    created: string;
    businessId: string;
    event: XenditWebhookEventType;
    data: any;
}

export type XenditWebhookEventType =
    | "invoices.paid"
    | "invoices.expired"
    | "invoices.payment.failed"
    | "recurring.plan.created"
    | "recurring.plan.activated"
    | "recurring.plan.inactivated"
    | "recurring.cycle.created"
    | "recurring.cycle.succeeded"
    | "recurring.cycle.failed"
    | "payouts.completed"
    | "payouts.failed"
    | "payouts.reversed"
    | "payment_methods.activated"
    | "payment_methods.inactivated"
    | "payment_methods.expired";

// API Response Types
export interface XenditAPIError {
    errorCode: string;
    message: string;
    errors?: Array<{
        path: string;
        message: string;
    }>;
}

export interface XenditListResponse<T> {
    data: T[];
    hasMore: boolean;
    links?: {
        href: string;
        rel: string;
        method: string;
    }[];
}

// Helper Types
export type XenditCurrency = "IDR" | "PHP" | "MYR" | "SGD" | "THB" | "VND";

export type XenditPaymentStatus =
    | "PENDING"
    | "PAID"
    | "SETTLED"
    | "FAILED"
    | "EXPIRED";

export type XenditChannelCode =
    // Banks
    | "BCA"
    | "BNI"
    | "BRI"
    | "MANDIRI"
    | "PERMATA"
    | "BSI"
    | "BJB"
    | "CIMB"
    // E-wallets
    | "OVO"
    | "DANA"
    | "LINKAJA"
    | "SHOPEEPAY"
    | "GCASH"
    | "GRABPAY"
    | "PAYMAYA"
    // Retail outlets
    | "ALFAMART"
    | "INDOMARET"
    | "7ELEVEN"
    // QR codes
    | "QRIS";

export interface XenditFeeRule {
    description: string;
    routes: string[];
    unit: "flat" | "percent";
    amount: number;
    currency: string;
}

// Request Types
export interface CreateXenditInvoiceRequest {
    externalId: string;
    amount: number;
    description: string;
    customer?: {
        givenNames: string;
        surname?: string;
        email?: string;
        mobileNumber?: string;
        addresses?: Array<{
            city?: string;
            country: string;
            postalCode?: string;
            state?: string;
            streetLine1?: string;
            streetLine2?: string;
        }>;
    };
    customerNotificationPreference?: {
        invoiceCreated?: string[];
        invoiceReminder?: string[];
        invoicePaid?: string[];
        invoiceExpired?: string[];
    };
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
    paymentMethods?: string[];
    currency?: string;
    locale?: string;
    reminderTimeUnit?: "days" | "hours";
    reminderTime?: number;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
        category?: string;
        url?: string;
    }>;
    fees?: Array<{
        type: string;
        value: number;
        percentage?: number;
    }>;
    fixedVa?: boolean;
    shouldAuthenticateCreditCard?: boolean;
    midLabel?: string;
    metadata?: Record<string, any>;
}