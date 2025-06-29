import React from 'react';
import { CheckCircle, Edit3 } from 'lucide-react';

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    if (status === 'PUBLISHED') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                <CheckCircle className="h-3 w-3" />
                Published
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
            <Edit3 className="h-3 w-3" />
            Draft
        </span>
    );
};