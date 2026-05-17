'use client'

import { useState } from 'react'
import type { FacebookPage } from '@/lib/api/types'
import { PagesDesktopTable } from './PagesDesktopTable'
import { PagesMobileList } from './PagesMobileList'
import { PageToggleDialog } from './PageToggleDialog'
import { PageDeleteDialog } from './PageDeleteDialog'

interface PagesListProps {
  pages: FacebookPage[]
  orgId: string
  onToggle: (pageId: string) => void
  onDelete: (pageId: string) => void
  onSyncInsights: (pageId: string) => void
  isToggling?: boolean
  isDeleting?: boolean
  isSyncing?: boolean
}

export function PagesList({
  pages, orgId,
  onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing,
}: PagesListProps) {
  const [pageToDelete, setPageToDelete] = useState<FacebookPage | null>(null)
  const [pageToToggle, setPageToToggle] = useState<FacebookPage | null>(null)

  const handleToggleConfirm = () => {
    if (pageToToggle) { onToggle(pageToToggle.id); setPageToToggle(null) }
  }

  const handleDeleteConfirm = () => {
    if (pageToDelete) { onDelete(pageToDelete.id); setPageToDelete(null) }
  }

  const sharedProps = {
    orgId,
    onSyncInsights,
    onToggle: setPageToToggle,
    onDelete: setPageToDelete,
    isToggling,
    isDeleting,
    isSyncing,
  }

  return (
    <>
      <PagesDesktopTable pages={pages} {...sharedProps} />
      <PagesMobileList   pages={pages} {...sharedProps} />

      <PageToggleDialog
        page={pageToToggle}
        isToggling={isToggling}
        onConfirm={handleToggleConfirm}
        onCancel={() => setPageToToggle(null)}
      />

      <PageDeleteDialog
        page={pageToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPageToDelete(null)}
      />
    </>
  )
}