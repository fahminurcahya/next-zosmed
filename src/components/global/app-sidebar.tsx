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

import { BarChart3, Bot, CreditCard, Hourglass, LayoutDashboard, LifeBuoy, Mail, MailCheck, MenuIcon, Percent, Presentation, Settings, Shield, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { redirect, usePathname } from "next/navigation"
import Logo from "./logo"
import Link from "next/link"

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
        title: "Integrations",
        url: "/integrations",
        icon: Shield,
    },
    {
        title: "Analitycs",
        url: "/analitycs",
        icon: BarChart3,
    },
    {
        title: "Lead & CRM",
        url: "/lead-crm",
        icon: Users,
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
    {
        title: "Help Center",
        url: "/help-center",
        icon: LifeBuoy,
    },
]

const admin_items = [
    {
        title: "Email Queue",
        url: "/admin/email-queue",
        icon: MailCheck,
    },
    {
        title: "Waiting List",
        url: "/admin/waiting-list",
        icon: Hourglass,
    },
    {
        title: "Plans",
        url: "/admin/plans",
        icon: CreditCard,
    },
    {
        title: "Discounts",
        url: "/admin/discounts",
        icon: Percent,
    },
];


type UserProps = {
    role: string;
};

export function AppSidebar({ role }: UserProps) {
    const pathname = usePathname()
    const { open } = useSidebar()

    if (pathname === "/onboarding") {
        return redirect("/dashboard")
    }

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent className="">
                {(role != "admin") &&
                    <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 !text-white': pathname === item.url,
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
                }
                {(role == "admin") &&
                    <SidebarGroup>
                        <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {admin_items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 !text-white': pathname === item.url,
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
                }
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
