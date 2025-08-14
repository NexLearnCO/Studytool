import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NexLearn.ai - AI-Powered Learning Platform",
  description: "Transform your learning with AI-powered tools for notes, flashcards, practice, and analytics",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
            <AppSidebar />
            <main className="flex-1">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
