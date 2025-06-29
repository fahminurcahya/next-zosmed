// components/workflow-empty-state.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
    onCreateClick: () => void;
}

export default function WorkflowEmptyState({ onCreateClick }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
        >
            <Card className="max-w-2xl w-full p-8 text-center border-0 shadow-lg">
                {/* Icon */}
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Zap className="h-12 w-12 text-purple-600" />
                    </div>
                    <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    >
                        <Sparkles className="h-4 w-4 text-yellow-900" />
                    </motion.div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Create Your First Workflow
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start automating your Instagram engagement with powerful workflows.
                    Reply to comments, send DMs, and grow your audience on autopilot.
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={onCreateClick}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workflow
                    </Button>
                    <Link href="/templates">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            Browse Templates
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                {/* Features */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <FeatureCard
                        icon="💬"
                        title="Auto Reply"
                        description="Reply to comments instantly with AI"
                    />
                    <FeatureCard
                        icon="📩"
                        title="Smart DMs"
                        description="Send personalized messages at scale"
                    />
                    <FeatureCard
                        icon="📊"
                        title="Analytics"
                        description="Track performance and optimize"
                    />
                </div>
            </Card>
        </motion.div>
    );
}

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <div className="text-center">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
);