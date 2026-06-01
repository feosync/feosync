'use client'

import { Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react'
import type { PostStatus } from '@/lib/api/types'

const THIS_YEAR    = new Date().getFullYear()
export const CONST_TABS: { label: string; value: PostStatus | 'all'; icon: any }[] = [
  { label: 'Tous',       value: 'all',       icon: FileText     },
  { label: 'Brouillons', value: 'DRAFT',     icon: FileText     },
  { label: 'Planifiés',  value: 'SCHEDULED', icon: Calendar     },
  { label: 'Publiés',    value: 'PUBLISHED', icon: CheckCircle2 },
  { label: 'Échoués',    value: 'FAILED',    icon: XCircle      },
]

export const CONST_YEARS = Array.from({ length: 3 }, (_, i) => THIS_YEAR - i)

export const CONST_MONTHS = [
  { value: 1,  label: 'Janvier'   }, { value: 2,  label: 'Février'   },
  { value: 3,  label: 'Mars'      }, { value: 4,  label: 'Avril'     },
  { value: 5,  label: 'Mai'       }, { value: 6,  label: 'Juin'      },
  { value: 7,  label: 'Juillet'   }, { value: 8,  label: 'Août'      },
  { value: 9,  label: 'Septembre' }, { value: 10, label: 'Octobre'   },
  { value: 11, label: 'Novembre'  }, { value: 12, label: 'Décembre'  },
]