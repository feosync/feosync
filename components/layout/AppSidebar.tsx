"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faTimes,
  faSpellCheck,
  faCrown,
  faAnglesLeft,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/hooks/useAuth";
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(NAVIGATION_ITEMS.map((s) => s.section)),
  );
  const { dark, toggle } = useDarkMode(); // ← destructure les deux

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  // Filtrer les sections admin si l'utilisateur n'est pas admin
  const visibleSections = NAVIGATION_ITEMS.filter(
    (section) => !section.adminOnly || user?.is_admin,
  );

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40 transition-all duration-300 flex flex-col overflow-hidden flex-shrink-0 gap-4",
          "fixed md:relative",
          isOpen ? "w-64" : "w-0 md:w-16",
        )}
      >
        {/* Logo + bouton fermer (mobile) */}
        <div className={cn(
          "h-14 flex items-center px-2 shrink-0",
          isOpen ? "justify-between": "justify-center"
        )}>
          <>
            {/* Logo */}
            <span className="h-8 w-8">
              <Image
                src={
                  dark
                    ? "/images/dark/feosync_icon.png"
                    : "/images/light/feosync_icon.png"
                }
                alt="FeoSync logo"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </span>

            {/* Bouton fermer (affiché seulement si isopen est true) */}
            {isOpen && (
              <span
                className="h-8 w-8 hover:bg-muted transition-colors flex justify-center items-center rounded-xl cursor-pointer"
                onClick={close}
              >
                <FontAwesomeIcon icon={faAnglesLeft} />
              </span>
            )}
          </>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-3 px-2">
          {visibleSections.map((section) => (
            <div key={section.section} >
              {isOpen && (
                <button
                  onClick={() => toggleSection(section.section)}
                  className={cn(
                    "flex items-center justify-between w-full px-2 py-1 text-xs font-semibold hover:text-slate-800 dark:hover:text-slate-200 h-10",
                    section.adminOnly
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {section.section}
                  </span>

                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      expandedSections.has(section.section)
                        ? "rotate-0"
                        : "-rotate-90",
                    )}
                  />
                </button>
              )}

              <div
                className={cn(
                  "space-y-0.5",
                  isOpen && !expandedSections.has(section.section)
                    ? "hidden"
                    : "",
                )}
              >
                {section.items.map((item) => {
                  const icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) close();
                      }}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-2 rounded-lg text-md font-medium transition-colors h-10" ,
                          isActive
                            ? section.adminOnly
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                              : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200",
                          !isOpen && "md:justify-center md:px-2",
                        )}
                      >
                        <FontAwesomeIcon
                          icon={icon}
                          className="w-8 h-8 shrink-0"
                        />
                        {isOpen && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/*  bouton d'abonnement */}
        <div className="p-4 border-slate-200 dark:border-slate-800">
          <Button
            size="sm"
            className="w-full"
            onClick={() => setShowSubscriptionDialog(true)}
          >
            <FontAwesomeIcon icon={faCrown} className="w-4 h-4 mr-2" />
            {isOpen && "Souscrire à un plan"}
          </Button>
        </div>
      </aside>
      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      />
    </>
  );
}
