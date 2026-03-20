'use client'

import { useState } from 'react'
import { Bell, Trash2, CheckCheck, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
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

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)

  const { data: notifications = [], isLoading } = useNotifications(unreadOnly)
  const markReadMutation = useMarkNotificationRead()
  const markAllMutation  = useMarkAllRead()
  const deleteMutation   = useDeleteNotification()

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Tout est à jour'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnreadOnly(v => !v)}
            className={cn(
              'text-[13px] border-slate-200 dark:border-slate-700 gap-1.5',
              unreadOnly && 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            {unreadOnly ? 'Toutes' : 'Non lues'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="text-[13px] border-slate-200 dark:border-slate-700 gap-1.5"
            >
              {markAllMutation.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <CheckCheck className="w-3.5 h-3.5" />
              }
              Tout lire
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Bell className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            Aucune notification
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {unreadOnly ? 'Toutes les notifications ont été lues.' : 'Vous êtes à jour !'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map(notif => (
            <NotificationRow
              key={notif.id}
              notif={notif}
              onMarkRead={() => markReadMutation.mutate(notif.id)}
              onDelete={() => deleteMutation.mutate(notif.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationRow({
  notif, onMarkRead, onDelete, isDeleting
}: {
  notif: Notification
  onMarkRead: () => void
  onDelete: () => void
  isDeleting?: boolean
}) {
  const config = TYPE_CONFIG[notif.type] || { icon: '🔔', color: 'bg-slate-50 dark:bg-slate-800' }

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-4 transition-colors group',
        !notif.is_read
          ? 'bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
        !notif.is_read && 'cursor-pointer'
      )}
      onClick={() => !notif.is_read && onMarkRead()}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full ${config.color} flex items-center justify-center flex-shrink-0 text-base`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-[13px] leading-snug',
            !notif.is_read
              ? 'font-medium text-slate-900 dark:text-white'
              : 'text-slate-700 dark:text-slate-300'
          )}>
            {notif.title}
          </p>
          {!notif.is_read && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {notif.message}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          {format(new Date(notif.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
        </p>
      </div>

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
        onClick={e => { e.stopPropagation(); onDelete() }}
        disabled={isDeleting}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}