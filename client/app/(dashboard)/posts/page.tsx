'use client'

import { useState } from 'react'
import { Plus, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useScheduledPosts, useDeleteScheduledPost } from '@/hooks/useScheduledPosts'
import { useOrganisations } from '@/hooks/useOrganisations'
import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/posts/EmptyState'
import { useRouter } from 'next/navigation'
import type { PostStatus } from '@/lib/api/types'

const TABS: { label: string; value: PostStatus | 'all'; icon: any }[] = [
  { label: 'Tous',       value: 'all',       icon: FileText     },
  { label: 'Brouillons', value: 'DRAFT',     icon: FileText     },
  { label: 'Planifiés',  value: 'SCHEDULED', icon: Calendar     },
  { label: 'Publiés',    value: 'PUBLISHED', icon: CheckCircle2 },
  { label: 'Échoués',    value: 'FAILED',    icon: XCircle      },
]

export default function PostsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<PostStatus | 'all'>('all')

  const { data: orgs = [] } = useOrganisations()
  const orgId = orgs[0]?.id || ''

  const { data: posts = [], isLoading } = useScheduledPosts(orgId)
  const deleteMutation = useDeleteScheduledPost(orgId)

  const filtered = activeTab === 'all'
    ? posts
    : posts.filter((p: any) => p.status === activeTab)

  const countByStatus = (s: PostStatus | 'all') =>
    s === 'all' ? posts.length : posts.filter((p: any) => p.status === s).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Posts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gérez vos publications planifiées
          </p>
        </div>
        <Button
          onClick={() => router.push('/posts/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nouveau post
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] border-b-2 -mb-px transition-colors ${
              activeTab === tab.value
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.value
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {countByStatus(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          status={activeTab}
          onCreateClick={() => router.push('/posts/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => router.push(`/posts/${post.id}`)}
              onDelete={() => deleteMutation.mutate(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}