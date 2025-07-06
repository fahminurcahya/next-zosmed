import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import TopLoader from "@/components/global/top-loader";
import ReduxProvider from "@/providers/redux-provider";

export const metadata: Metadata = {
  title: "Zosmed",
  description: "Social Media Automation Platform",
  icons: [{ rel: "icon", url: "/logo.ico" }],
};



const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // pilih sesuai kebutuhan
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.className}`}>
      <body>
        <TopLoader />
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
