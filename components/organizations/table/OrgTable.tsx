'use client'

import { useState } from 'react'
import type { Organisation } from '@/lib/api/types'
import { OrgDesktopTable } from './OrgDesktopTable'
import { OrgMobileList } from './OrgMobileList'
import { OrgDeleteDialog } from './OrgDeleteDialog'
import { OrgDetailSheet } from '@/components/organizations/OrgDetailSheet'

interface OrgTableProps {
  organisations: Organisation[]
  onEdit: (org: Organisation) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function OrgTable({ organisations, onEdit, onDelete, isDeleting }: OrgTableProps) {
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null)
  const [orgToDelete, setOrgToDelete] = useState<Organisation | null>(null)

  const handleDeleteConfirm = () => {
    if (orgToDelete) {
      onDelete(orgToDelete.id)
      setOrgToDelete(null)
    }
  }

  return (
    <>
      <OrgDesktopTable
        organisations={organisations}
        onView={setSelectedOrg}
        onEdit={onEdit}
        onDelete={setOrgToDelete}
      />

      <OrgMobileList
        organisations={organisations}
        onEdit={onEdit}
        onDelete={setOrgToDelete}
      />

      {/* <OrgDetailSheet
        org={selectedOrg}
        onClose={() => setSelectedOrg(null)}
      /> */}

      <OrgDeleteDialog
        org={orgToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOrgToDelete(null)}
      />
    </>
  )
}