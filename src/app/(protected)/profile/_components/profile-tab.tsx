import { Building2, Lock, Shield, User } from "lucide-react";
import { motion } from 'framer-motion';
import { Separator } from "@/components/ui/separator";


interface Tab {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'business', name: 'Business Info', icon: Building2 },
    { id: 'security', name: 'Security', icon: Shield }
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    return (
        <>
            <div className="px-6 pt-4">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`pb-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${isActive
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                                    }`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.name}</span>
                            </motion.button>
                        );
                    })}
                </nav>
            </div>
            <Separator className="mt-2" />
        </>
    );
}
