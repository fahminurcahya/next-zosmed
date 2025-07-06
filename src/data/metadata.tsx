import { BarChart3, Bot, CheckCircle, Clock, Crown, Eye, Facebook, FileText, Gift, Globe, Instagram, Lock, MessageCircle, Rocket, Shield, Target, Timer, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";

export const Plans = [
    {
        name: "Free",
        price: "Gratis",
        period: "selamanya",
        color: "from-gray-500 to-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        features: [
            "1 akun Instagram",
            "100 auto-reply per bulan",
            "20 AI-powered reply",
            "Template Workflow",
        ],
        notIncluded: ["Advanced Analytics Dashboard", "Priority support", "Lead scoring", "Priority support"],
        cta: "Mulai Gratis", popular: false
    },
    {
        name: "Starter",
        price: "Rp 149.000",
        period: "per bulan",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        popular: true,
        features: [
            "3 akun Business Instagram",
            "2000 auto-reply per bulan",
            "500 AI-powered reply",
            "Template Workflow",
            "AI intent detection",
            "Advanced Analytics Dashboard",
        ],
        notIncluded: ["Lead scoring", "Priority support"],
        cta: "Mulai Gratis"

    },
    {
        name: "Pro",
        price: "Rp 399.000",
        period: "per bulan",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        features: [
            "5 akun Business Instagram",
            "10.000 auto-reply per bulan",
            "500 AI-powered reply",
            "Template Workflow",
            "AI intent detection",
            "Advanced Analytics Dashboard",
            "Lead scoring",
            "Priority support"
        ],
        notIncluded: [],
        popular: false,
        cta: "Mulai Gratis"
    }
];

export const Requirements = [
    { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: "Minimal umur 18 tahun", type: "allowed" },
    { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: "Memiliki akun Instagram yang sah", type: "allowed" },
    { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: "Mematuhi aturan Instagram dan hukum Indonesia", type: "allowed" },
    { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: "Bertanggung jawab atas aktivitas di akun Anda", type: "allowed" }
];

export const Responsibilities = [
    { icon: <CheckCircle className="w-5 h-5 text-blue-500" />, text: "Memberikan informasi yang benar dan lengkap", type: "user" },
    { icon: <CheckCircle className="w-5 h-5 text-blue-500" />, text: "Menjaga kerahasiaan password dan credentials", type: "user" },
    { icon: <CheckCircle className="w-5 h-5 text-blue-500" />, text: "Melaporkan jika ada akses tidak sah ke akun", type: "user" },
    { icon: <CheckCircle className="w-5 h-5 text-blue-500" />, text: "Menggunakan akun untuk tujuan bisnis yang legal", type: "user" }
];

export const OurRights = [
    { icon: <Shield className="w-5 h-5 text-purple-500" />, text: "Menonaktifkan akun jika melanggar aturan", type: "platform" },
    { icon: <Shield className="w-5 h-5 text-purple-500" />, text: "Meminta verifikasi identitas jika diperlukan", type: "platform" },
    { icon: <Shield className="w-5 h-5 text-purple-500" />, text: "Mengupdate fitur dan platform secara berkala", type: "platform" },
    { icon: <Shield className="w-5 h-5 text-purple-500" />, text: "Menghentikan layanan dengan pemberitahuan", type: "platform" }
];

export const Services = [
    { icon: <Instagram className="w-6 h-6" />, title: "Otomasi Instagram", desc: "Membalas komentar otomatis ke DM" },
    { icon: <Users className="w-6 h-6" />, title: "Lead Management", desc: "Mengelola lead dan customer" },
    { icon: <Zap className="w-6 h-6" />, title: "AI Response", desc: "Respon cerdas dengan AI" },
    { icon: <Shield className="w-6 h-6" />, title: "Analytics", desc: "Menganalisis performa Instagram" }
];

export const AllowedUses = [
    "Menggunakan untuk bisnis legal dan legitimate",
    "Mengotomasi respon customer service yang profesional",
    "Menganalisis performa marketing dan engagement",
    "Mengelola lead dan prospek dengan etis"
];

export const ProhibitedUses = [
    "Spam atau harassment kepada pengguna lain",
    "Konten ilegal, menyinggung, atau berbahaya",
    "Melanggar aturan dan kebijakan Instagram",
    "Menjual atau transfer akun ke pihak lain",
    "Menggunakan untuk aktivitas penipuan atau fraud",
    "Impersonation atau menyamar sebagai orang lain"
];

export const Limitations = [
    "Kerusakan atau kerugian tidak langsung dari penggunaan platform",
    "Masalah dengan Instagram (server down, perubahan aturan, API issues)",
    "Kehilangan data akibat kesalahan pengguna atau force majeure",
    "Hasil bisnis yang tidak sesuai harapan atau ekspektasi"
];

export const TerminationReasons = [
    "Anda bisa berhenti berlangganan kapan saja melalui dashboard",
    "Kami bisa menghentikan layanan jika melanggar aturan atau ToS",
    "Platform dapat diupdate atau dihentikan dengan pemberitahuan 30 hari",
    "Akun dapat ditangguhkan sementara untuk investigasi keamanan"
];




// privacy
export const Highlights = [
    { icon: <Lock className="w-6 h-6" />, title: "Data Aman", desc: "Enkripsi tingkat bank", color: "from-green-500 to-emerald-500" },
    { icon: <Eye className="w-6 h-6" />, title: "Transparan", desc: "Anda tahu data apa yang kami kumpulkan", color: "from-blue-500 to-cyan-500" },
    { icon: <Users className="w-6 h-6" />, title: "Tidak Dijual", desc: "Data Anda tidak pernah dijual ke pihak ketiga", color: "from-purple-500 to-pink-500" },
    { icon: <FileText className="w-6 h-6" />, title: "Kontrol Penuh", desc: "Anda bisa lihat, ubah, atau hapus data", color: "from-orange-500 to-red-500" }
];



// landing page 
export const Problems = [
    { icon: <Timer className="w-8 h-8" />, title: "Terlambat Respon", desc: "Kehilangan leads karena tidak bisa balas komentar 24/7" },
    { icon: <Users className="w-8 h-8" />, title: "Butuh Banyak Admin", desc: "Biaya admin mahal untuk monitor dan balas komentar manual" },
    { icon: <TrendingUp className="w-8 h-8" />, title: "Konversi Rendah", desc: "Banyak leads hilang karena proses follow-up yang lambat" }
];

export const Solutions = [
    {
        icon: <Bot className="w-8 h-8" />,
        title: "AI-Powered Automation",
        desc: "Sistem pintar yang bekerja 24/7 tanpa istirahat",
        features: ["Respon instan", "Konteks percakapan", "Personalisasi otomatis"]
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Setup Super Mudah",
        desc: "Aktifkan dalam hitungan menit, bukan hari",
        features: ["No-code setup", "Template siap pakai", "Integrasi 1-klik"]
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Aman & Terpercaya",
        desc: "Compliance dengan kebijakan Instagram terbaru",
        features: ["Rate limiting", "Human-like behavior", "Anti-spam protection"]
    }
];

export const MainFeatures = [
    {
        icon: <MessageCircle className="w-12 h-12" />,
        title: "Auto-Reply Komentar → DM",
        desc: "Sistem otomatis yang mendeteksi komentar dan langsung membalas dengan template yang disesuaikan",
        benefits: ["Respon instan 24/7", "Template yang dapat disesuaikan", "Filtering komentar spam", "Tracking conversion rate"],
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: <Bot className="w-12 h-12" />,
        title: "AI Smart Response",
        desc: "Teknologi AI yang memahami konteks percakapan dan memberikan respon yang natural dan personal",
        benefits: ["Pemahaman konteks", "Respon natural & personal", "Learning dari interaksi", "Multi-bahasa support"],
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: <Target className="w-12 h-12" />,
        title: "Lead Scoring & Nurturing",
        desc: "Sistem pintar yang menilai kualitas leads dan melakukan nurturing otomatis dengan strategi tepat",
        benefits: ["Scoring otomatis", "Nurturing sequence personal", "Segmentasi leads", "ROI tracking akurat"],
        color: "from-green-500 to-teal-500"
    }
];

export const AdditionalFeatures = [
    { icon: <BarChart3 className="w-8 h-8" />, title: "Advanced Analytics", desc: "Dashboard komprehensif dengan insights mendalam" },
    { icon: <Globe className="w-8 h-8" />, title: "Multi-Account Management", desc: "Kelola multiple akun dari satu dashboard" },
    { icon: <Shield className="w-8 h-8" />, title: "Enterprise Security", desc: "Keamanan tingkat enterprise dengan encryption" },
    { icon: <Zap className="w-8 h-8" />, title: "Lightning Fast Setup", desc: "Setup dalam 5 menit dengan wizard yang mudah" },
];

export const Platforms = [
    {
        icon: <Instagram className="w-8 h-8" />,
        name: "Instagram",
        status: "Available Now",
        color: "from-pink-500 to-purple-500",
        statusColor: "bg-green-100 text-green-800"
    },
    {
        icon: <Facebook className="w-8 h-8" />,
        name: "Facebook",
        status: "Coming soon",
        color: "from-blue-600 to-blue-800",
        statusColor: "bg-blue-100 text-blue-800"
    },
    {
        icon: <SiWhatsapp className="w-8 h-8" />,
        name: "WhatsApp",
        status: "Coming soon",
        color: "from-green-500 to-green-700",
        statusColor: "bg-green-100 text-green-800"
    },
    {
        icon: <SiTelegram className="w-8 h-8" />,
        name: "Telegram",
        status: "Coming soon",
        color: "from-sky-400 to-blue-600",
        statusColor: "bg-sky-100 text-sky-800"
    },
    {
        icon: <MessageCircle className="w-8 h-8" />,
        name: "Messenger",
        status: "Coming soon",
        color: "from-indigo-500 to-indigo-700",
        statusColor: "bg-indigo-100 text-indigo-800"
    }
];

export const Faqs = [
    {
        question: "Apakah Zosmed aman untuk akun Instagram saya?",
        answer: "Absolut aman! Zosmed menggunakan teknologi keamanan enterprise dengan rate limiting yang ketat, behavior pattern seperti manusia, dan full compliance dengan kebijakan Instagram."
    },
    {
        question: "Berapa lama setup dan onboarding process?",
        answer: "Setup super cepat hanya 5 menit! Kami menyediakan wizard step-by-step yang mudah diikuti"
    },
    {
        question: "Apakah perlu skill teknis untuk menggunakan Zosmed?",
        answer: "Tidak sama sekali! Zosmed dirancang untuk semua orang. Interface drag-and-drop yang intuitif, template siap pakai, dan dokumentasi lengkap."
    },
    {
        question: "Bagaimana cara kerja AI Smart Response?",
        answer: "AI kami menganalisis konteks percakapan, history interaksi, dan profil leads untuk memberikan respon yang personal dan relevan."
    }
];

export const Benefits = [
    { icon: <Clock className="w-5 h-5" />, text: "Setup dalam 5 menit" },
    { icon: <Shield className="w-5 h-5" />, text: "100% aman & compliant" },
    { icon: <Zap className="w-5 h-5" />, text: "ROI positif dalam 30 hari" },
    { icon: <Users className="w-5 h-5" />, text: "Support 24/7" }
];

export const BetaBenefits = [
    { icon: <Crown className="w-5 h-5" />, title: "Lifetime Access", desc: "Akses seumur hidup dengan harga special" },
    { icon: <Trophy className="w-5 h-5" />, title: "Personal Onboarding", desc: "Setup 1-on-1 dengan expert kami" },
    { icon: <Gift className="w-5 h-5" />, title: "Premium Features", desc: "Gratis 3 bulan fitur premium" },
    { icon: <Rocket className="w-5 h-5" />, title: "Priority Support", desc: "24/7 priority support & feature requests" }
];

export const ProductLinks = [
    { name: "Fitur", href: "#features" },
    { name: "Harga", href: "#pricing" },
    { name: "Platform", href: "#platforms" }
];

export const SupportLinks = [
    { name: "Pusat Bantuan", href: "#faq" },
];


export const LegalLinks = [
    { name: "Privacy Policy", href: "/legal/privacy" },
    { name: "Terms of Service", href: "/legal/tos" },
];


export const Settings = {
    isShowWaitingList: false,
    isShowCountDown: false,
}

