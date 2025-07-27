
import type {
    XenditChannelCode,
    XenditPaymentMethod,
    XenditInvoice,
    XenditPaymentStatus,
    XenditCurrency,
} from "@/types/xendit.type";

// Channel code mappings
export const XENDIT_CHANNEL_NAMES: Record<XenditChannelCode, string> = {
    // Banks
    BCA: "Bank Central Asia",
    BNI: "Bank Negara Indonesia",
    BRI: "Bank Rakyat Indonesia",
    MANDIRI: "Bank Mandiri",
    PERMATA: "Bank Permata",
    BSI: "Bank Syariah Indonesia",
    BJB: "Bank Jabar Banten",
    CIMB: "CIMB Niaga",
    // E-wallets
    OVO: "OVO",
    DANA: "DANA",
    LINKAJA: "LinkAja",
    SHOPEEPAY: "ShopeePay",
    GCASH: "GCash",
    GRABPAY: "GrabPay",
    PAYMAYA: "PayMaya",
    // Retail outlets
    ALFAMART: "Alfamart",
    INDOMARET: "Indomaret",
    "7ELEVEN": "7-Eleven",
    // QR codes
    QRIS: "QRIS",
};

export const XENDIT_CHANNEL_LOGOS: Record<XenditChannelCode, string> = {
    // Banks
    BCA: "/images/banks/bca.png",
    BNI: "/images/banks/bni.png",
    BRI: "/images/banks/bri.png",
    MANDIRI: "/images/banks/mandiri.png",
    PERMATA: "/images/banks/permata.png",
    BSI: "/images/banks/bsi.png",
    BJB: "/images/banks/bjb.png",
    CIMB: "/images/banks/cimb.png",
    // E-wallets
    OVO: "/images/ewallets/ovo.png",
    DANA: "/images/ewallets/dana.png",
    LINKAJA: "/images/ewallets/linkaja.png",
    SHOPEEPAY: "/images/ewallets/shopeepay.png",
    GCASH: "/images/ewallets/gcash.png",
    GRABPAY: "/images/ewallets/grabpay.png",
    PAYMAYA: "/images/ewallets/paymaya.png",
    // Retail outlets
    ALFAMART: "/images/retail/alfamart.png",
    INDOMARET: "/images/retail/indomaret.png",
    "7ELEVEN": "/images/retail/7eleven.png",
    // QR codes
    QRIS: "/images/qr/qris.png",
};

// Format currency
export function formatXenditCurrency(amount: number, currency: XenditCurrency = "IDR"): string {
    const formatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return formatter.format(amount);
}

// Get payment method display info
export function getPaymentMethodInfo(method: XenditPaymentMethod) {
    let channelCode: string = "";
    let channelName: string = "";
    let displayName: string = "";
    let logo: string = "";

    switch (method.type) {
        case "CARD":
            channelCode = method.card?.brand || "CARD";
            channelName = method.card?.brand || "Credit/Debit Card";
            displayName = `${channelName} •••• ${method.card?.maskedCardNumber?.slice(-4)}`;
            logo = `/images/cards/${method.card?.brand?.toLowerCase()}.png`;
            break;

        case "EWALLET":
            channelCode = method.ewallet?.channelCode || "";
            channelName = XENDIT_CHANNEL_NAMES[channelCode as XenditChannelCode] || channelCode;
            displayName = channelName;
            logo = XENDIT_CHANNEL_LOGOS[channelCode as XenditChannelCode] || "";
            break;

        case "VIRTUAL_ACCOUNT":
            channelCode = method.virtualAccount?.channelCode || "";
            channelName = XENDIT_CHANNEL_NAMES[channelCode as XenditChannelCode] || channelCode;
            displayName = `${channelName} Virtual Account`;
            logo = XENDIT_CHANNEL_LOGOS[channelCode as XenditChannelCode] || "";
            break;

        case "OVER_THE_COUNTER":
            channelCode = method.overTheCounter?.channelCode || "";
            channelName = XENDIT_CHANNEL_NAMES[channelCode as XenditChannelCode] || channelCode;
            displayName = channelName;
            logo = XENDIT_CHANNEL_LOGOS[channelCode as XenditChannelCode] || "";
            break;

        case "QR_CODE":
            channelCode = method.qrCode?.channelCode || "";
            channelName = XENDIT_CHANNEL_NAMES[channelCode as XenditChannelCode] || channelCode;
            displayName = `${channelName} QR`;
            logo = XENDIT_CHANNEL_LOGOS[channelCode as XenditChannelCode] || "";
            break;

        default:
            displayName = method.type;
    }

    return {
        type: method.type,
        channelCode,
        channelName,
        displayName,
        logo,
        status: method.status,
        reusability: method.reusability,
    };
}

// Group payment methods by type
export function groupPaymentMethods(methods: XenditPaymentMethod[]) {
    console.log(methods)
    const grouped: Record<string, XenditPaymentMethod[]> = {
        CARD: [],
        EWALLET: [],
        VIRTUAL_ACCOUNT: [],
        OVER_THE_COUNTER: [],
        QR_CODE: [],
    };

    methods.forEach(method => {
        if (grouped[method.type]) {
            grouped[method.type]!.push(method);
        }
    });

    return Object.entries(grouped)
        .filter(([_, methods]) => methods.length > 0)
        .map(([type, methods]) => ({
            type,
            displayName: getPaymentTypeDisplayName(type),
            methods: methods.map(m => ({
                ...m,
                info: getPaymentMethodInfo(m),
            })),
        }));
}

// Get payment type display name
export function getPaymentTypeDisplayName(type: string): string {
    const typeNames: Record<string, string> = {
        CARD: "Credit/Debit Card",
        EWALLET: "E-Wallet",
        VIRTUAL_ACCOUNT: "Virtual Account",
        OVER_THE_COUNTER: "Retail Outlet",
        QR_CODE: "QR Code",
        DIRECT_DEBIT: "Direct Debit",
    };

    return typeNames[type] || type;
}

// Calculate payment fees
export function calculateXenditFees(amount: number, paymentMethod?: string): {
    adminFee: number;
    paymentFee: number;
    totalFee: number;
    totalAmount: number;
} {
    const adminFee = 5000; // Fixed admin fee
    let paymentFee = 0;

    // Payment method specific fees (example rates)
    if (paymentMethod) {
        switch (paymentMethod) {
            case "CREDIT_CARD":
                paymentFee = amount * 0.029; // 2.9%
                break;
            case "OVO":
            case "DANA":
            case "LINKAJA":
            case "SHOPEEPAY":
                paymentFee = amount * 0.015; // 1.5%
                break;
            case "QRIS":
                paymentFee = amount * 0.007; // 0.7%
                break;
            case "BCA":
            case "BNI":
            case "BRI":
            case "MANDIRI":
                paymentFee = 4000; // Fixed fee for VA
                break;
            case "ALFAMART":
            case "INDOMARET":
                paymentFee = 5000; // Fixed fee for retail
                break;
        }
    }

    const totalFee = adminFee + Math.round(paymentFee);
    const totalAmount = amount + totalFee;

    return {
        adminFee,
        paymentFee: Math.round(paymentFee),
        totalFee,
        totalAmount,
    };
}

// Get payment status config
export function getXenditPaymentStatusConfig(status: XenditPaymentStatus) {
    const config: Record<XenditPaymentStatus, {
        label: string;
        color: string;
        icon: string;
        description: string;
    }> = {
        PENDING: {
            label: "Pending",
            color: "yellow",
            icon: "Clock",
            description: "Waiting for payment",
        },
        PAID: {
            label: "Paid",
            color: "green",
            icon: "CheckCircle",
            description: "Payment successful",
        },
        SETTLED: {
            label: "Settled",
            color: "blue",
            icon: "Check",
            description: "Payment settled to account",
        },
        FAILED: {
            label: "Failed",
            color: "red",
            icon: "XCircle",
            description: "Payment failed",
        },
        EXPIRED: {
            label: "Expired",
            color: "gray",
            icon: "Clock",
            description: "Payment link expired",
        },
    };

    return config[status] || config.PENDING;
}

// Format Xendit timestamp
export function formatXenditTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Get invoice payment instructions
export function getPaymentInstructions(invoice: XenditInvoice, channelCode: string) {
    const instructions: Record<string, string[]> = {
        // Virtual Account
        BCA: [
            "Login ke BCA mobile atau KlikBCA",
            "Pilih m-Transfer atau Transfer",
            "Pilih BCA Virtual Account",
            `Masukkan nomor Virtual Account: ${invoice.availableBanks?.[0]?.accountHolderName}`,
            `Masukkan jumlah: ${formatXenditCurrency(invoice.amount)}`,
            "Ikuti instruksi untuk menyelesaikan transaksi",
        ],
        // E-wallet
        OVO: [
            "Buka aplikasi OVO",
            "Tap 'Scan'",
            "Scan QR code yang ditampilkan",
            "Cek detail pembayaran",
            "Tap 'Bayar'",
            "Masukkan PIN OVO Anda",
        ],
        // Retail
        ALFAMART: [
            "Kunjungi gerai Alfamart terdekat",
            `Beritahu kasir: "Bayar ${invoice.merchantName}"`,
            `Berikan kode pembayaran: ${invoice.availableRetailOutlets?.[0]?.paymentCode}`,
            "Bayar sesuai jumlah yang tertera",
            "Simpan struk sebagai bukti pembayaran",
        ],
        // QR
        QRIS: [
            "Buka aplikasi e-wallet atau m-banking",
            "Pilih bayar dengan QR",
            "Scan QR code yang ditampilkan",
            "Konfirmasi pembayaran",
            "Masukkan PIN",
        ],
    };

    return instructions[channelCode] || [
        "Ikuti instruksi pembayaran yang tertera",
        "Pastikan jumlah yang dibayar sesuai",
        "Simpan bukti pembayaran",
    ];
}

// Validate Indonesian phone number
export function validateIndonesianPhoneNumber(phone: string): {
    isValid: boolean;
    formatted?: string;
    error?: string;
} {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Check if starts with country code
    let normalized = cleaned;
    if (cleaned.startsWith("62")) {
        normalized = cleaned;
    } else if (cleaned.startsWith("0")) {
        normalized = "62" + cleaned.substring(1);
    } else {
        return {
            isValid: false,
            error: "Phone number must start with 0 or 62",
        };
    }

    // Validate length (10-13 digits after country code)
    const withoutCountryCode = normalized.substring(2);
    if (withoutCountryCode.length < 10 || withoutCountryCode.length > 13) {
        return {
            isValid: false,
            error: "Invalid phone number length",
        };
    }

    // Validate operator prefix
    const validPrefixes = [
        "811", "812", "813", "814", "815", "816", "817", "818", "819", // Telkomsel
        "821", "822", "823", "852", "853", "851", // Indosat
        "895", "896", "897", "898", "899", // Tri
        "831", "832", "833", "838", // Axis
        "881", "882", "883", "884", "885", "886", "887", "888", "889", // Smartfren
    ];

    const prefix = withoutCountryCode.substring(0, 3);
    if (!validPrefixes.includes(prefix)) {
        return {
            isValid: false,
            error: "Invalid operator prefix",
        };
    }

    return {
        isValid: true,
        formatted: `+${normalized}`,
    };
}