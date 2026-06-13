'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut, faMoon, faSun, faBars, faCog } from '@fortawesome/free-solid-svg-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { useMyRole } from '@/hooks/useMyRole';
import { NotificationBell } from '@/components/notifications/NotificationsPopover';
import Image from 'next/image';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Badge } from '@/components/ui/badge';

export function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { dark, toggle: toggleTheme } = useDarkMode();
  const { toggle } = useSidebar();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const { data: roleData } = useMyRole()
  const isCollab = roleData?.role === "collaborator"

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  if (!user) return null;

  return (
    <nav id="onboarding-navbar" className={[
      "sticky top-0 z-30",
      "h-13 flex items-center",
      "bg-sidebar", 
      "px-3 gap-2",
    ].join(' ')}>

      {/* ── Hamburger (mobile seulement) ── */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0 md:hidden"
        aria-label="Ouvrir le menu"
      >
        <FontAwesomeIcon icon={faBars} className="w-4 h-4" />
      </Button>

      {/* ── Actions droite ── */}
      <div className="flex items-center gap-3 ml-auto">

        {/* Notifications */}
        <div className="w-8 h-8 flex items-center justify-center">
          <NotificationBell />
        </div>

        {/* Toggle dark mode */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          <FontAwesomeIcon
            icon={dark ? faSun : faMoon}
            className="w-3.5 h-3.5"
          />
        </Button>

        {/* ── Avatar + Dropdown ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity hover:opacity-80">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profile_picture || ''} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 bg-card border-border shadow-md"
            sideOffset={8}
          >
            {/* Identité */}
            <DropdownMenuLabel className="pb-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-card-foreground leading-tight">
                  {user.name}
                </p>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-4 font-medium ${
                    isCollab
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  }`}
                >
                  {isCollab ? "Collaborateur" : "Owner"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">
                {isCollab && roleData?.owner_name ? `de ${roleData.owner_name}` : user.email}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-border" />

            {/* Paramètres */}
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer text-sm text-foreground hover:bg-accent gap-2 focus:bg-accent">
                <FontAwesomeIcon icon={faCog} className="w-3.5 h-3.5 text-muted-foreground" />
                Paramètres
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="bg-border" />

            {/* Déconnexion */}
            <DropdownMenuItem
              className="cursor-pointer text-sm gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOut} className="w-3.5 h-3.5" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}