
import { useAuth } from "@/contexts/AuthContext"
import { Link, useLocation } from "react-router-dom"
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar"
import { 
  Kanban, 
  Users, 
  BarChart3, 
  BookOpen, 
  LifeBuoy, 
  Settings, 
  FileStack,
  Bot,
  LogOut,
  Home,
  ChevronDown,
  LayoutDashboard,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export function DashboardSidebar({ onToggleChat, isChatOpen }: DashboardSidebarProps) {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    analytics: true,
    development: false,
    community: false
  })

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-14">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">DreamStream</span>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/dashboard" || location.pathname === "/"}
                  tooltip="Dashboard"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Task Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Task Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname.includes("/dashboard")}
                  tooltip="Task Dashboard"
                >
                  <Link to="/dashboard">
                    <Kanban className="h-5 w-5" />
                    <span>Task Board</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Performance & Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Growth & Development</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/performance"}
                  tooltip="Performance"
                >
                  <Link to="/performance">
                    <BarChart3 className="h-5 w-5" />
                    <span>Performance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/training"}
                  tooltip="Training"
                >
                  <Link to="/training">
                    <BookOpen className="h-5 w-5" />
                    <span>Training</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/portfolio"}
                  tooltip="Portfolio"
                >
                  <Link to="/portfolio">
                    <FileStack className="h-5 w-5" />
                    <span>Portfolio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Community & Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Community & Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/community"}
                  tooltip="Community"
                >
                  <Link to="/community">
                    <Users className="h-5 w-5" />
                    <span>Community</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/cos-agent"}
                  tooltip="CoS Agent"
                >
                  <Link to="/cos-agent">
                    <Bot className="h-5 w-5" />
                    <span>CoS Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/support"}
                  tooltip="Support"
                >
                  <Link to="/support">
                    <LifeBuoy className="h-5 w-5" />
                    <span>Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex flex-col space-y-2">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start",
              isChatOpen && "bg-accent"
            )}
            onClick={onToggleChat}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            CoS Chat
          </Button>
          
          {currentUser && (
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
