'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Main', 'Management', 'Content', 'Publishing', 'Analytics', 'Account'])
  );
  const pathname = usePathname();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 md:hidden z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40 transition-all duration-300 flex flex-col',
          isOpen ? 'w-64' : 'w-0 md:w-16',
          'md:relative md:z-0'
        )}
      >
        {/* Logo section */}
        <div className={cn('p-4 border-b border-slate-200 dark:border-slate-800', isOpen ? '' : 'md:flex md:flex-col md:items-center')}>
          <div className={cn('font-bold text-xl text-blue-600 truncate', isOpen ? 'block' : 'hidden md:block')}>
            FeoSync
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          {NAVIGATION_ITEMS.map((section) => (
            <div key={section.section}>
              {isOpen && (
                <button
                  onClick={() => toggleSection(section.section)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  {section.section}
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 transition-transform',
                      expandedSections.has(section.section) ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>
              )}

              <div
                className={cn(
                  'space-y-1',
                  isOpen && !expandedSections.has(section.section) ? 'hidden' : ''
                )}
              >
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200',
                          !isOpen && 'md:justify-center'
                        )}
                      >
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
      </aside>
    </>
  );
}
