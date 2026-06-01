import { cn } from '@/lib/utils'
import { CONST_TABS } from '../const'
import type { PostStatus } from '@/lib/api/types'

interface PostsStatusTabsProps {
  activeTab: PostStatus | 'all'
  onChange: (tab: PostStatus | 'all') => void
}

export function PostsStatusTabs({ activeTab, onChange }: PostsStatusTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex gap-0.5 border-b border-border min-w-max">
        {CONST_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-[13px] border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab.value
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}