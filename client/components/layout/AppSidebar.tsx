'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X, ShieldCheck, Crown } from 'lucide-react'
import { cn } from '@/lib/utils';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { SubscriptionDialog } from '@/components/plans/SubscriptionDialog';
import { Button } from  '@/components/ui/button';


export function AppSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { user } = useAuth();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(NAVIGATION_ITEMS.map(s => s.section))
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  // Filtrer les sections admin si l'utilisateur n'est pas admin
  const visibleSections = NAVIGATION_ITEMS.filter(
    section => !section.adminOnly || user?.is_admin
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

      <aside className={cn(
        'h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40 transition-all duration-300 flex flex-col overflow-hidden flex-shrink-0',
        'fixed md:relative',
        isOpen ? 'w-64' : 'w-0 md:w-14'
      )}>

        {/* Logo + bouton fermer (mobile) */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          {isOpen ? (
            <>
              <span className="font-bold text-blue-600 text-lg">FeoSync</span>
              <button
                onClick={close}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="hidden md:flex w-7 h-7 bg-blue-600 rounded-lg items-center justify-center text-white text-xs font-bold mx-auto">
              FS
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-3 px-2">
          {visibleSections.map(section => (
            <div key={section.section}>
              {isOpen && (
                <button
                  onClick={() => toggleSection(section.section)}
                  className={cn(
                    'flex items-center justify-between w-full px-2 py-1 text-xs font-semibold hover:text-slate-800 dark:hover:text-slate-200',
                    section.adminOnly
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {section.adminOnly && <ShieldCheck className="w-3 h-3" />}
                    {section.section}
                  </span>
                  <ChevronDown className={cn(
                    'w-3 h-3 transition-transform duration-200',
                    expandedSections.has(section.section) ? 'rotate-0' : '-rotate-90'
                  )} />
                </button>
              )}

              <div className={cn(
                'space-y-0.5',
                isOpen && !expandedSections.has(section.section) ? 'hidden' : ''
              )}>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { if (window.innerWidth < 768) close() }}
                    >
                      <div className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? section.adminOnly
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200',
                        !isOpen && 'md:justify-center md:px-2'
                      )}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {isOpen && <span className="truncate">{item.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
          
        {/*  bouton d'abonnement */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            
            size="sm"
            className="w-full"      onClick={() => setShowSubscriptionDialog(true)}
          >
            <Crown className="w-4 h-4 mr-2" />
            {isOpen && 'Souscrire à un plan'}
          </Button>
        </div>
        
      </aside>
      {/* Subscription Dialog */}
        <SubscriptionDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog} />
    </>
  );
}