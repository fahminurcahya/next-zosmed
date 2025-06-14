'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"

import { Bot, CreditCard, LayoutDashboard, MenuIcon, Presentation, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Logo from "./logo"
import Link from "next/link"
import { UserDropdownMenu } from "./user-dropdown-menu"
// import { UserDropdownMenu } from "./user-dropdown-menu"

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Workflows",
        url: "/workflows",
        icon: Bot,
    },
    {
        title: "Credentials",
        url: "/credentials",
        icon: Shield,
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard,
    },
]

type UserProps = {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | undefined | null;
};

export function AppSidebar() {
    const pathname = usePathname()
    const { open } = useSidebar()

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent className="">
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className={cn({
                                            '!bg-primary !text-white': pathname === item.url,
                                        })}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {!open && (
                    <>
                        <SidebarSeparator />
                        <SidebarTrigger className="text-stone-500 hover:text-stone-900 self-center" />
                    </>
                )}
            </SidebarContent>
        </Sidebar>
    )
}
