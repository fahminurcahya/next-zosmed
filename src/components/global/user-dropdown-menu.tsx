'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    LogOut,
    CreditCard,
    Bell,
    User,
    MoreVertical,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';

type UserProps = {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | undefined | null;
};

export function UserDropdownMenu({ user }: { user: UserProps }) {

    const router = useRouter();
    const signOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.refresh();
                },
                onError: (ctx) => {
                    alert(ctx.error.message);
                },
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start rounded-xl px-3 py-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left text-sm font-medium leading-tigh">
                        <span className="">{user.name}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger >

            <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
                <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    );
}
