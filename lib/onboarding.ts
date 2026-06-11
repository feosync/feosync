export interface OnboardingState {
  welcomeSeen: boolean
  tourCompleted: boolean
  checklist: ChecklistProgress
  dismissedTooltips: string[]
}

export interface ChecklistProgress {
  profileCompleted: boolean
  orgCreated: boolean
  postScheduled: boolean
  postPublished: boolean
  settingsVisited: boolean
}

export interface TourStep {
  targetId: string
  title: string
  description: string
  position: 'bottom' | 'top' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'onboarding-sidebar',
    title: 'Navigation principale',
    description: 'Accédez à toutes les sections de l\'application depuis le menu latéral : tableau de bord, publications, analyses et administration.',
    position: 'right',
  },
  {
    targetId: 'onboarding-navbar',
    title: 'Barre d\'outils',
    description: 'Consultez vos notifications, basculez entre les thèmes clair/sombre et accédez à vos paramètres depuis l\'avatar.',
    position: 'bottom',
  },
  {
    targetId: 'onboarding-stats',
    title: 'Vue d\'ensemble',
    description: 'Suivez vos indicateurs clés en un coup d\'œil : publications publiées, planifiées, brouillons et échouées.',
    position: 'bottom',
  },
  {
    targetId: 'onboarding-posts',
    title: 'Planificateur de posts',
    description: 'Créez, programmez et gérez vos publications Facebook en quelques clics avec l\'assistance de l\'IA.',
    position: 'left',
  },
  {
    targetId: 'onboarding-checklist',
    title: 'Checklist de démarrage',
    description: 'Suivez votre progression et découvrez toutes les fonctionnalités essentielles de FeoSync.',
    position: 'top',
  },
]

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  welcomeSeen: false,
  tourCompleted: false,
  checklist: {
    profileCompleted: false,
    orgCreated: false,
    postScheduled: false,
    postPublished: false,
    settingsVisited: false,
  },
  dismissedTooltips: [],
}

export const STORAGE_KEY_PREFIX = 'feosync_onboarding_'

export function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

export function CHECKLIST_ITEMS(onboarding: OnboardingState) {
  return [
    {
      id: 'profileCompleted' as const,
      label: 'Compléter votre profil',
      description: 'Ajoutez votre photo et vérifiez vos informations.',
      done: onboarding.checklist.profileCompleted,
      href: '/settings',
    },
    {
      id: 'orgCreated' as const,
      label: 'Créer une organisation',
      description: 'Configurez votre première organisation pour gérer vos pages.',
      done: onboarding.checklist.orgCreated,
      href: '/organizations',
    },
    {
      id: 'postScheduled' as const,
      label: 'Programmer un post',
      description: 'Créez et planifiez votre première publication Facebook.',
      done: onboarding.checklist.postScheduled,
      href: '/posts/new',
    },
    {
      id: 'postPublished' as const,
      label: 'Publier un post',
      description: 'Publiez un contenu et observez les résultats.',
      done: onboarding.checklist.postPublished,
      href: '/posts/new',
    },
    {
      id: 'settingsVisited' as const,
      label: 'Explorer les paramètres',
      description: 'Personnalisez votre expérience FeoSync.',
      done: onboarding.checklist.settingsVisited,
      href: '/settings',
    },
  ]
}

export function computeProgress(onboarding: OnboardingState): number {
  const items = Object.values(onboarding.checklist)
  const done = items.filter(Boolean).length
  return Math.round((done / items.length) * 100)
}
