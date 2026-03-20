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
          className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
        >
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          <span className="text-[12px] text-slate-600 dark:text-slate-400 group-hover:text-blue-600">
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}