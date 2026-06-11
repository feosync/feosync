'use client'

import { Edit3, ImageIcon, Calendar } from 'lucide-react'

interface Props {
  onEditCaption: () => void
  onEditImage: () => void
  onEditDate: () => void
}

const actions = [
  { key: 'caption', label: 'Caption', icon: Edit3 },
  { key: 'image',   label: 'Image',   icon: ImageIcon },
  { key: 'date',    label: 'Date',    icon: Calendar },
] as const

export function PostActionsGrid({ onEditCaption, onEditImage, onEditDate }: Props) {
  const handlers = { caption: onEditCaption, image: onEditImage, date: onEditDate }

  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={handlers[key]}
          className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          <span className="text-[12px] text-muted-foreground group-hover:text-primary">
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}