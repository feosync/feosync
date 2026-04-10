import { toast } from 'sonner'
import type { UserDetail } from '@/lib/api/types'

export function checkCanCreateOrg(userDetail?: UserDetail): boolean {
  const plan = userDetail?.plan
  const orgCount = userDetail?.org_count ?? 0

  const canCreate = plan
    ? plan.max_org === -1 || orgCount < plan.max_org
    : orgCount < 1

  if (!canCreate) {
    const max = plan?.max_org ?? 1
    toast.error(`Votre plan vous limite à ${max} organisation(s). Passez à un plan supérieur.`)
  }

  return canCreate
}

export function checkCanCreatePost(userDetail?: UserDetail): boolean {
  const plan = userDetail?.plan
  const postCount = userDetail?.post_month_count ?? 0

  const canCreate = plan
    ? plan.max_post_month === -1 || postCount < plan.max_post_month
    : postCount < 7

  if (!canCreate) {
    const max = plan?.max_post_month ?? 7
    toast.error(`Votre plan vous limite à ${max} post(s) par mois. Passez à un plan supérieur.`)
  }

  return canCreate
}