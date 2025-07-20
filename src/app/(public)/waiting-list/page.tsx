import { Bot, Zap, TrendingUp, Shield } from "lucide-react";
import WaitinglistForm from "./_components/waiting-list-form";

export default function WaitinglistPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                        Zosmed - Coming Soon!
                    </h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        Otomasi Instagram yang akan mengubah cara Anda berinteraksi dengan
                        followers. Auto reply, auto DM, dan workflow automation dalam satu
                        platform.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={<Bot className="w-8 h-8" />}
                        title="AI-Powered Reply"
                        description="Reply comment otomatis dengan AI yang natural dan kontekstual"
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8" />}
                        title="Auto DM"
                        description="Kirim DM otomatis ke komentator untuk meningkatkan engagement"
                    />
                    <FeatureCard
                        icon={<TrendingUp className="w-8 h-8" />}
                        title="Analytics"
                        description="Pantau performa dan ROI dari setiap automation workflow"
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8" />}
                        title="Rate Limit Safe"
                        description="Sistem cerdas yang menjaga akun Anda tetap aman dari limit IG"
                    />
                </div>

                {/* Form Section */}
                <WaitinglistForm />

                {/* Stats Section */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 mb-4">
                        Join dengan business owner lainnya
                    </p>
                    <div className="flex justify-center gap-8">
                        <Stat number="50%" label="Early Bird Discount" />
                        <Stat number="24/7" label="Support" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-500 mb-4">{icon}</div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );
}

function Stat({ number, label }: { number: string; label: string }) {
    return (
        <div>
            <div className="text-3xl font-bold text-blue-600">{number}</div>
            <div className="text-gray-600">{label}</div>
        </div>
    );
}