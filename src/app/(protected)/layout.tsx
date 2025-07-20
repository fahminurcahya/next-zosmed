import { AppSidebar } from "@/components/global/app-sidebar"
import BreadcrumbHeader from "@/components/global/breadcrumb-header"
import { UserDropdownMenu } from "@/components/global/user-dropdown-menu";
import { SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingPage from "./onboarding/page";


export default async function SidebarLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return redirect("/sign-in");
    }
    if (!session?.user.hasOnboarding) {
        return <OnboardingPage />
    }

    return (
        <SidebarProvider>
            <AppSidebar role={session.user.role!} />
            <main className="w-full m-2">
                <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
                    <BreadcrumbHeader />
                    <div className="ml-auto"></div>
                    <UserDropdownMenu user={session.user} />
                </div>
                <div className="h-4"></div>
                <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
