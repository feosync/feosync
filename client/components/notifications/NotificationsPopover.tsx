'use client'

import { useState } from 'react'
import { Bell, Trash2, CheckCheck, Filter, Loader2, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
  useNotificationSummary,
} from '@/hooks/useNotifications'
import type { Notification, NotificationType } from '@/lib/api/types'

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string }> = {
  post_published:   { icon: '✅', color: 'bg-green-50  dark:bg-green-950/50'  },
  post_failed:      { icon: '❌', color: 'bg-red-50    dark:bg-red-950/50'    },
  insights_updated: { icon: '📊', color: 'bg-blue-50   dark:bg-blue-950/50'   },
  token_expiring:   { icon: '⚠️', color: 'bg-amber-50  dark:bg-amber-950/50'  },
  welcome:          { icon: '👋', color: 'bg-indigo-50 dark:bg-indigo-950/50' },
  schedule_created: { icon: '📅', color: 'bg-slate-50  dark:bg-slate-800/50'  },
}

// ─── Badge sur l'icône ───────────────────────────────────────────────────────
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: summary } = useNotificationSummary()
  const unread = summary?.unread_count ?? 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none ring-2 ring-white dark:ring-slate-950">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] max-w-[calc(100vw-16px)] p-0 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800"
      >
        <NotificationsPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

// ─── Panel principal ─────────────────────────────────────────────────────────
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [unreadOnly, setUnreadOnly] = useState(false)

  const { data: notifications = [], isLoading } = useNotifications(unreadOnly)
  const markRead    = useMarkNotificationRead()
  const markAll     = useMarkAllRead()
  const deleteNotif = useDeleteNotification()

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUnreadOnly(v => !v)}
            className={cn(
              'text-[12px] h-7 px-2.5 gap-1',
              unreadOnly && 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
            )}
          >
            <Filter className="w-3 h-3" />
            {unreadOnly ? 'Toutes' : 'Non lues'}
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="text-[12px] h-7 px-2.5 gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              {markAll.isPending
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <CheckCheck className="w-3 h-3" />
              }
              Tout lire
            </Button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="overflow-y-auto  max-h-[420px]">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <BellOff className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              Aucune notification
            </p>
            <p className="text-[12px] text-slate-400 text-center">
              {unreadOnly ? 'Toutes les notifications ont été lues.' : 'Vous êtes à jour !'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map(notif => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onMarkRead={() => markRead.mutate(notif.id)}
                onDelete={() => deleteNotif.mutate(notif.id)}
                isDeleting={deleteNotif.isPending && deleteNotif.variables === notif.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 text-center">
          <button
            onClick={onClose}
            className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Voir toutes les notifications →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Item individuel ─────────────────────────────────────────────────────────
function NotificationItem({
  notif, onMarkRead, onDelete, isDeleting,
}: {
  notif: Notification
  onMarkRead: () => void
  onDelete: () => void
  isDeleting?: boolean
}) {
  const config = TYPE_CONFIG[notif.type] ?? { icon: '🔔', color: 'bg-slate-50 dark:bg-slate-800' }

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-3 py-3 group transition-colors',
        !notif.is_read
          ? 'bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
      )}
      onClick={() => !notif.is_read && onMarkRead()}
    >
      {/* Icône type */}
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base',
        config.color
      )}>
        {config.icon}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn(
            'text-[13px] leading-snug truncate',
            !notif.is_read
              ? 'font-semibold text-slate-900 dark:text-white'
              : 'font-normal text-slate-700 dark:text-slate-300'
          )}>
            {notif.title}
          </p>
          {!notif.is_read && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          {format(new Date(notif.created_at), "d MMM 'à' HH:mm", { locale: fr })}
        </p>
      </div>

      {/* Supprimer */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 flex-shrink-0 mt-0.5"
        onClick={e => { e.stopPropagation(); onDelete() }}
        disabled={isDeleting}
      >
        {isDeleting
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Trash2 className="w-3.5 h-3.5" />
        }
      </Button>
    </div>
  )
}