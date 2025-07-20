'use client';

import { Calendar, User, Lock, Building2 } from 'lucide-react';
import { CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
    profile: {
        name: string;
        email: string;
        createdAt: Date;
    };
    subscription?: {
        planName: string;
    } | null;
}

export function ProfileHeader({ profile, subscription }: ProfileHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <CardHeader className="flex flex-row items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {subscription?.planName || 'Free'} Plan
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Member since {profile.createdAt.toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </CardHeader>
        </motion.div>
    );
}