'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/lib/services';
import { cn } from '@/lib/utils';

export function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const count = await notificationService.getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    };

    fetchUnreadCount();
  }, [user]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side - hidden on desktop */}
        <div className="md:hidden w-10" />

        {/* Center - logo (mobile only) */}
        <div className="md:hidden text-center">
          <span className="font-bold text-blue-600">FeoSync</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </Link>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
