'use client'

import { useState } from 'react'
import { useAdminDeletePlan } from '@/hooks/usePlans'
import type { Plan } from '@/lib/api/types'
import { PlansDesktopTable } from './PlansDesktopTable'
import { PlansMobileList } from './PlansMobileList'
import { PlanDeleteDialog } from './PlanDeleteDialog'

interface Props {
  plans: Plan[]
  isLoading: boolean
  onEdit: (plan: Plan) => void
}

export function PlansTable({ plans, isLoading, onEdit }: Props) {
  const [toDelete, setToDelete] = useState<Plan | null>(null)
  const deletePlan = useAdminDeletePlan()

  const handleConfirmDelete = () => {
    if (toDelete) {
      deletePlan.mutate(String(toDelete.id))
      setToDelete(null)
    }
  }

  const sharedProps = {
    plans,
    isLoading,
    onEdit,
    onDelete: setToDelete,
  }

  return (
    <>
      <PlansDesktopTable {...sharedProps} />
      <PlansMobileList  {...sharedProps} />

      <PlanDeleteDialog
        plan={toDelete}
        isDeleting={deletePlan.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}