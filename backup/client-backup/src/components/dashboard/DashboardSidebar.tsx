import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, FileText, CalendarDays, BarChart3,
  Sparkles, Globe, Star, Settings, LogOut, Bell, Clock, ChevronDown
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

const NAV_ITEMS = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Publications", url: "/dashboard/posts", icon: FileText },
  { title: "Calendrier", url: "/dashboard/calendar", icon: CalendarDays },
  { title: "Génération IA", url: "/dashboard/ai", icon: Sparkles },
  { title: "Automatisation", url: "/dashboard/schedules", icon: Clock },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Pages Facebook", url: "/dashboard/pages", icon: Globe },
  { title: "Avis clients", url: "/dashboard/reviews", icon: Star },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
          <span className="serif text-sm font-bold text-primary-foreground">F</span>
        </div>
        {!collapsed && (
          <span className="serif text-lg whitespace-nowrap">
            Feo<span className="text-primary">Sync</span>
          </span>
        )}
      </div>

      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        <SidebarMenuButton asChild>
          <NavLink to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent transition-all"
            activeClassName="bg-sidebar-accent text-primary font-medium">
            <Settings className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span>Paramètres</span>}
          </NavLink>
        </SidebarMenuButton>

        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.orgName}</div>
            </div>
          </div>
        )}

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
