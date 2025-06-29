import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface RunStatusIconProps {
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | null;
}

export const RunStatusIcon = ({ status }: RunStatusIconProps) => {
    switch (status) {
        case 'SUCCESS':
            return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        case 'FAILED':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'PENDING':
            return <Clock className="h-4 w-4 text-amber-500" />;
        default:
            return <Clock className="h-4 w-4 text-gray-400" />;
    }
};