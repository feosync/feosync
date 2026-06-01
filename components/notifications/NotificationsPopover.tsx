'use client'

import { useState } from 'react'
import { Bell, Trash2, CheckCheck, Filter, Loader2, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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

// Configuration des types (plus minimaliste)
const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  post_published:   { icon: '✓', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  post_failed:      { icon: '✕', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  insights_updated: { icon: '📈', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  token_expiring:   { icon: '⚠', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  welcome:          { icon: '👋', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  schedule_created: { icon: '📅', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
}

// ====================== BELL ======================

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: summary } = useNotificationSummary()
  const unread = summary?.unread ?? 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative w-9 h-9 hover:bg-muted/50 transition-colors"
        >
          <Bell className="w-5 h-5 text-foreground" />
          
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center
                           min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold
                           bg-primary text-primary-foreground rounded-full
                           ring-2 ring-background shadow-sm">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[380px] p-0 overflow-hidden rounded-2xl shadow-xl border border-border/60 bg-popover"
      >
        <NotificationsPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

// ====================== PANEL ======================

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [unreadOnly, setUnreadOnly] = useState(false)

  const { data: notifications = [], isLoading } = useNotifications(unreadOnly)
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllRead()
  const deleteNotif = useDeleteNotification()

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="flex flex-col max-h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUnreadOnly(v => !v)}
            className={cn(
              "text-xs h-8 px-3 rounded-xl transition-all",
              unreadOnly 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            {unreadOnly ? 'Toutes' : 'Non lues'}
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="text-xs h-8 px-3 rounded-xl text-primary hover:bg-primary/10"
            >
              {markAll.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              <span className="ml-1.5">Tout lire</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <LoadingState />
        ) : notifications.length === 0 ? (
          <EmptyState unreadOnly={unreadOnly} />
        ) : (
          <div className="divide-y divide-border/60">
            {notifications.map((notif) => (
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
        <div className="px-5 py-3 border-t border-border/60 text-center">
          <button
            onClick={onClose}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Voir toutes les notifications →
          </button>
        </div>
      )}
    </div>
  )
}

// ====================== ITEM ======================

function NotificationItem({
  notif,
  onMarkRead,
  onDelete,
  isDeleting,
}: {
  notif: Notification
  onMarkRead: () => void
  onDelete: () => void
  isDeleting?: boolean
}) {
  const config = TYPE_CONFIG[notif.type] ?? { icon: '🔔', color: 'bg-muted text-muted-foreground' }

  return (
    <div
      className={cn(
        'group px-5 py-4 flex gap-4 transition-all duration-200 hover:bg-muted/50 cursor-pointer relative',
        !notif.is_read && 'bg-primary/5'
      )}
      onClick={() => !notif.is_read && onMarkRead()}
    >
      {/* Icon */}
      <div className={cn(
        'w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg transition-transform group-hover:scale-105',
        config.color
      )}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-[14px] leading-tight',
            !notif.is_read 
              ? 'font-semibold text-foreground' 
              : 'text-foreground/90'
          )}>
            {notif.title}
          </p>
          
          {!notif.is_read && (
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {notif.message}
        </p>

        <p className="text-xs text-muted-foreground/70">
          {format(new Date(notif.created_at), "d MMM 'à' HH:mm", { locale: fr })}
        </p>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all
                   text-muted-foreground hover:text-destructive hover:bg-destructive/10
                   rounded-xl h-8 w-8"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}

// ====================== STATES ======================

function LoadingState() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 px-5 py-4">
          <Skeleton className="w-9 h-9 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ unreadOnly }: { unreadOnly: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mb-6">
        <BellOff className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-foreground mb-1">
        Aucune notification
      </p>
      <p className="text-sm text-muted-foreground max-w-[240px]">
        {unreadOnly 
          ? "Toutes les notifications ont été lues." 
          : "Vous êtes à jour. Rien de nouveau pour le moment."}
      </p>
    </div>
  )
}