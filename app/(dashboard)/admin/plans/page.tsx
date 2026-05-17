'use client'

import { useState } from 'react'
import { useAdminAllPlans } from '@/hooks/usePlans'
import { PlansTable, PlansPageHeader } from '@/components/admin/plans'
import { PlanDialog } from '@/components/admin/plans/PlanDialog'
import type { Plan } from '@/lib/api/types'

export default function AdminPlansPage() {
  const { data: plans = [], isLoading } = useAdminAllPlans()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | undefined>()

  const openCreate = () => { setEditing(undefined); setDialogOpen(true) }
  const openEdit   = (p: Plan) => { setEditing(p); setDialogOpen(true) }
  const closeDialog = () => { setDialogOpen(false); setEditing(undefined) }

  return (
    <div className="p-6 space-y-6">
      <PlansPageHeader count={plans.length} onCreate={openCreate} />

      <PlansTable
        plans={plans}
        isLoading={isLoading}
        onEdit={openEdit}
      />

      {dialogOpen && (
        <PlanDialog open={dialogOpen} onClose={closeDialog} initial={editing} />
      )}
    </div>
  )
}