"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Brain,
  FileText,
  Home,
  Settings,
  Target,
  User,
  Zap,
  ChevronDown,
  LogOut,
  CreditCard,
  Download,
  MapPin,
  ShoppingCart,
  Bookmark,
  Lock,
  BarChart3,
  Layers,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AINotesModal } from "@/components/ai-notes-modal"

const mainNavItems = [
  {
    title: "儀表板",
    url: "/",
    icon: Home,
  },
  {
    title: "AI導師",
    url: "/ai-tutor",
    icon: Brain,
    badge: "熱門",
  },
  {
    title: "練習工具",
    url: "/practice",
    icon: Target,
  },
  {
    title: "學習工具",
    url: "/study",
    icon: FileText,
  },
]

const studyTools = [
  {
    title: "AI 筆記生成器",
    url: "/ai-notes",
    icon: Zap,
    badge: "NEW",
    isModal: true,
  },
  {
    title: "我的筆記",
    url: "/notes",
    icon: FileText,
    badge: "NEW",
  },
  {
    title: "記憶卡片生成器",
    url: "/flashcards/generator",
    icon: FileText,
  },
  {
    title: "記憶卡片學習",
    url: "/flashcards/study",
    icon: BookOpen,
  },
  {
    title: "記憶卡片集",
    url: "/flashcards/collection",
    icon: Layers,
  },
  {
    title: "學習分析",
    url: "/analytics",
    icon: BarChart3,
    badge: "AI",
  },
]

const accountItems = [
  {
    title: "書籤",
    url: "/bookmarks",
    icon: Bookmark,
  },
  {
    title: "訂單",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "下載",
    url: "/downloads",
    icon: Download,
  },
  {
    title: "地址",
    url: "/addresses",
    icon: MapPin,
  },
  {
    title: "付款方式",
    url: "/payment",
    icon: CreditCard,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg">
            N
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">NexLearn.ai</h2>
            <p className="text-xs text-slate-500">AI學習平台</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant={item.badge === "熱門" ? "default" : "secondary"} className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>學習工具</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.isModal ? (
                    <AINotesModal>
                      <SidebarMenuButton className="w-full justify-start">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </AINotesModal>
                  ) : (
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>帳戶</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings" className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    <span>設定</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/reset-password" className="flex items-center gap-3">
                    <Lock className="h-4 w-4" />
                    <span>重設密碼</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>小明</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">王小明</span>
                    <span className="text-xs text-slate-500">高級會員</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>個人資料</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>設定</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>登出</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
