import { LayoutDashboard, BarChart3, Users, Settings, FolderOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "분석", url: "/analytics", icon: BarChart3 },
  { title: "프로젝트", url: "/projects", icon: FolderOpen },
  { title: "사용자", url: "/users", icon: Users },
  { title: "설정", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar className="w-[220px] border-r border-border">
      <div className="flex h-14 items-center px-5">
        <span className="text-lg font-bold text-foreground tracking-tight">Dashboard</span>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-label uppercase tracking-wider px-5">
            메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm text-muted-foreground rounded-lg transition-colors hover:bg-accent hover:text-foreground"
                      activeClassName="bg-accent text-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
