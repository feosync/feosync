import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Bell, Search } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/mockData";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 w-64">
                <Search size={15} className="text-muted-foreground" />
                <input placeholder="Rechercher..." className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted transition-colors relative">
                  <Bell size={18} className="text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                    <div className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <span className="font-semibold text-sm">Notifications</span>
                        <span className="text-xs text-primary cursor-pointer hover:underline">Tout marquer lu</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {NOTIFICATIONS.map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                            <p className="text-sm leading-snug">{n.message}</p>
                            <span className="text-xs text-muted-foreground mt-1 block">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground cursor-pointer">
                {user?.name.split(" ").map(n => n[0]).join("")}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
