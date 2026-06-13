
import type { Plan } from '@/lib/api/types'

export const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export const resolvePlanName = (planId: string | null | undefined, plans: Plan[]) => {
  if (!planId) return null
  return plans.find(p => String(p.id) === planId)?.name ?? `Plan #${planId}`
}