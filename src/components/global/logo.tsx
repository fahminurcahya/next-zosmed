import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import Image from 'next/image'
import React from 'react'

const Logo = () => {
    const { open } = useSidebar()
    return (
        <div className="flex items-center gap-0.5">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            {open && (
                <span className="text-xl font-semibold">
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                        Zosmed
                    </span>
                </span>
            )}
            {open && (
                <SidebarTrigger className="text-stone-500 hover:text-stone-900 ml-auto" />
            )}
        </div>
    )
}

export default Logo