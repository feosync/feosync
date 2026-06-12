"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCrown,
  faAnglesLeft,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useMyRole } from "@/hooks/useMyRole";
import { useState } from "react";
import { SubscriptionDialog } from "@/components/plans/SubscriptionDialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useDarkMode } from "@/hooks/useDarkMode";

export function AppSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { user } = useAuth();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const { data: roleData } = useMyRole();
  const isCollab = roleData?.role === "collaborator";

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(NAVIGATION_ITEMS.map((s) => s.section)),
  );
  const { dark } = useDarkMode();

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  const visibleSections = NAVIGATION_ITEMS.filter(
    (section) => !section.adminOnly || user?.is_admin,
  );

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-sidebar z-30 md:hidden backdrop-blur-sm"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "h-full bg-sidebar z-40 flex flex-col overflow-hidden shrink-0",
          "fixed md:relative",
          "transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "w-60" : "w-0 md:w-14",
        )}
      >
        {/* ── Header : Logo + bouton collapse ── */}
        <div
          className={cn(
            "h-14 flex items-center shrink-0 px-3",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
          <span className="w-7 h-7 shrink-0">
            <Image
              src={
                dark
                  ? "/images/dark/feosync_icon.png"
                  : "/images/light/feosync_icon.png"
              }
              alt="FeoSync"
              width={28}
              height={28}
              className="w-full h-full"
            />
          </span>

          {isOpen && (
            <button
              onClick={close}
              className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Réduire le menu"
            >
              <FontAwesomeIcon icon={faAnglesLeft} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav id="onboarding-sidebar" className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {visibleSections.map((section) => (
            <div key={section.section}>

              {/* Label de section (sidebar ouverte seulement) */}
              {isOpen && (
                <button
                  onClick={() => toggleSection(section.section)}
                  className={cn(
                    "flex items-center justify-between w-full px-2 py-1 mb-0.5 rounded-md transition-colors",
                    section.adminOnly
                      ? "text-destructive/85"
                      : "text-foreground/65 ",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {section.section}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={cn(
                      "w-2.5 h-2.5 transition-transform duration-200",
                      expandedSections.has(section.section) ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>
              )}

              {/* Items de navigation */}
              <div
                className={cn(
                  "space-y-0.5",
                  isOpen && !expandedSections.has(section.section) ? "hidden" : "",
                )}
              >
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname?.startsWith(item.href + "/");
                  const isAdmin = section.adminOnly;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      id={item.href === "/posts" ? "onboarding-posts" : item.href === "/settings" ? "onboarding-settings" : undefined}
                      onClick={() => {
                        if (window.innerWidth < 768) close();
                      }}
                    >
                        <div
                          className={cn(
                            "flex items-center gap-2.5 px-2 h-9 rounded-lg text-sm font-medium transition-all duration-150",
                            isActive
                              ? isAdmin
                                ? "bg-destructive/50 text-foreground/85"
                                : "bg-primary/30 text-foreground"
                              : "text-foreground/75 hover:bg-accent hover:text-accent-foreground",
                            !isOpen && "md:justify-center md:px-0",
                          )}
                          title={!isOpen ? item.label : undefined}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isActive ? "text-foreground" : "text-foreground/70",
                            )}
                          />
                          {isOpen && (
                            <span className="truncate text-[13px]">{item.label}</span>
                          )}

                          {isActive && isOpen && (
                            <span className="ml-auto w-1 h-4 rounded-full shrink-0 bg-foreground animate-[fade-in_0.2s_ease-out]" />
                          )}
                        </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bouton abonnement (masqué pour les collaborateurs) ── */}
        {!isCollab && <div className={cn(
          "p-3 border-t border-border",
          !isOpen && "flex justify-center",
        )}>
          {isOpen ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-9 text-xs font-medium border-border hover:bg-accent text-foreground gap-2 transition-colors"
              onClick={() => setShowSubscriptionDialog(true)}
            >
              <FontAwesomeIcon icon={faCrown} className="w-3.5 h-3.5 text-primary" />
              Souscrire à un plan
            </Button>
          ) : (
            <button
              onClick={() => setShowSubscriptionDialog(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              title="Souscrire à un plan"
            >
              <FontAwesomeIcon icon={faCrown} className="w-4 h-4" />
            </button>
          )}
        </div>}
      </aside>

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      />
    </>
  );
}