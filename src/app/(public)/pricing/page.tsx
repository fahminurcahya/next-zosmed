"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
    const router = useRouter();
    const plansQuery = api.plans.getActivePlans.useQuery();

    if (plansQuery.isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const plans = plansQuery.data || [];

    return (
        <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Pilih Plan yang Tepat untuk Bisnis Anda
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Mulai gratis dan upgrade kapan saja. Semua plan termasuk akses ke
                        automation workflow dan integrasi Instagram.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    {plans.map((plan, index) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onSelect={() => router.push(`/register?plan=${plan.code}`)}
                            isMiddle={index === 1}
                        />
                    ))}
                </div>

                {/* Feature Comparison */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Bandingkan Fitur
                    </h2>
                    <FeatureComparison plans={plans} />
                </div>

                {/* FAQ Section */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="max-w-3xl mx-auto space-y-6">
                        <FAQItem
                            question="Apakah saya bisa upgrade atau downgrade plan?"
                            answer="Ya, Anda bisa mengubah plan kapan saja. Perubahan akan berlaku di periode billing berikutnya."
                        />
                        <FAQItem
                            question="Apakah ada kontrak jangka panjang?"
                            answer="Tidak, semua plan bersifat bulanan dan bisa dibatalkan kapan saja tanpa penalti."
                        />
                        <FAQItem
                            question="Bagaimana dengan limit DM dan AI reply?"
                            answer="Limit akan direset setiap awal bulan. Unused quota tidak akan diakumulasi ke bulan berikutnya."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PlanCardProps {
    plan: any;
    onSelect: () => void;
    isMiddle: boolean;
}

function PlanCard({ plan, onSelect, isMiddle }: PlanCardProps) {
    const isPopular = plan.popular;

    return (
        <div
            className={`relative ${isPopular ? "transform scale-105 shadow-2xl" : "shadow-lg"
                }`}
        >
            {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1">
                        {plan.badge}
                    </Badge>
                </div>
            )}

            <Card
                className={`h-full ${plan.bgColor} border-2 ${plan.borderColor
                    } ${isPopular ? "border-opacity-100" : "border-opacity-50"}`}
            >
                <div className="p-8">
                    {/* Plan Name & Price */}
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            <span className="text-gray-600 ml-2">{plan.period}</span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        {plan.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature}</span>
                            </div>
                        ))}
                        {plan.notIncluded.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start opacity-50">
                                <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-500 line-through">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                        onClick={onSelect}
                        className={`w-full py-6 text-lg font-semibold bg-gradient-to-r ${plan.color
                            } text-white hover:opacity-90 transition ${isPopular ? "shadow-lg" : ""
                            }`}
                    >
                        {plan.cta}
                    </Button>

                    {/* Limits Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            {plan.limits.maxAccounts} Instagram accounts
                        </p>
                        <p className="text-sm text-gray-600 text-center">
                            {plan.limits.maxDMPerMonth.toLocaleString()} DM/bulan
                        </p>
                        {plan.limits.maxAIReplyPerMonth > 0 && (
                            <p className="text-sm text-gray-600 text-center">
                                {plan.limits.maxAIReplyPerMonth.toLocaleString()} AI reply/bulan
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}

interface FeatureComparisonProps {
    plans: any[];
}

function FeatureComparison({ plans }: FeatureComparisonProps) {
    const features = [
        { name: "Instagram Accounts", key: "maxAccounts" },
        { name: "Auto Reply per Bulan", key: "maxDMPerMonth" },
        { name: "AI-Powered Reply", key: "maxAIReplyPerMonth" },
        { name: "Template Workflow", included: [true, true, true] },
        { name: "AI Intent Detection", included: [false, true, true] },
        { name: "Analytics Dashboard", included: [false, true, true] },
        { name: "Lead Scoring", included: [false, false, true] },
        { name: "Priority Support", included: [false, false, true] },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-4 px-6">Features</th>
                        {plans.map((plan) => (
                            <th key={plan.id} className="text-center py-4 px-6">
                                <div>
                                    <p className="font-semibold text-lg">{plan.name}</p>
                                    <p className="text-sm text-gray-600">{plan.price}</p>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {features.map((feature, idx) => (
                        <tr key={idx} className="border-b">
                            <td className="py-4 px-6 font-medium">{feature.name}</td>
                            {plans.map((plan, planIdx) => (
                                <td key={plan.id} className="text-center py-4 px-6">
                                    {feature.key ? (
                                        <span className="font-semibold">
                                            {plan.limits[feature.key].toLocaleString()}
                                        </span>
                                    ) : feature.included?.[planIdx] ? (
                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                    ) : (
                                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface FAQItemProps {
    question: string;
    answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">{question}</h3>
            <p className="text-gray-600">{answer}</p>
        </div>
    );
}