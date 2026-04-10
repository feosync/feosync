import { toast } from 'sonner'
import type { UserDetail } from '@/lib/api/types'

// ── Fonctions pures (pas de toast) ────────────────────────────────────────────

export function canCreateOrg(userDetail?: UserDetail): boolean {
  const plan = userDetail?.plan
  const orgCount = userDetail?.org_count ?? 0
  return plan ? plan.max_org === -1 || orgCount < plan.max_org : orgCount < 1
}

export function canCreatePost(userDetail?: UserDetail): boolean {
  const plan = userDetail?.plan
  const postCount = userDetail?.post_month_count ?? 0
  return plan ? plan.max_post_month === -1 || postCount < plan.max_post_month : postCount < 7
}

export function canGenerateCaption(userDetail?: UserDetail): boolean {
  const plan = userDetail?.plan
  const captionCount = userDetail?.ai_caption_count ?? 0
  return plan ? plan.max_ai_caption === -1 || captionCount < plan.max_ai_caption : captionCount < 1
}

export function canGenerateImage(userDetail?: UserDetail): boolean {
  const plan = userDetail?.plan
  const imageCount = userDetail?.ai_image_count ?? 0
  return plan ? plan.max_ai_image === -1 || imageCount < plan.max_ai_image : imageCount < 0
}

// ── Fonctions avec toast (pour les actions) ───────────────────────────────────

export function checkCanCreateOrg(userDetail?: UserDetail): boolean {
  const ok = canCreateOrg(userDetail)
  if (!ok) toast.error(`Votre plan vous limite à ${userDetail?.plan?.max_org ?? 1} organisation(s). Passez à un plan supérieur.`)
  return ok
}

export function checkCanCreatePost(userDetail?: UserDetail): boolean {
  const ok = canCreatePost(userDetail)
  if (!ok) toast.error(`Votre plan vous limite à ${userDetail?.plan?.max_post_month ?? 7} post(s) par mois. Passez à un plan supérieur.`)
  return ok
}

export function checkCanGenerateCaption(userDetail?: UserDetail): boolean {
  const ok = canGenerateCaption(userDetail)
  if (!ok) toast.error(`Votre plan vous limite à ${userDetail?.plan?.max_ai_caption ?? 20} caption(s) IA par mois. Passez à un plan supérieur.`)
  return ok
}

export function checkCanGenerateImage(userDetail?: UserDetail): boolean {
  const ok = canGenerateImage(userDetail)
  if (!ok) toast.error(`Votre plan vous limite à ${userDetail?.plan?.max_ai_image ?? 10} image(s) IA par mois. Passez à un plan supérieur.`)
  return ok
}