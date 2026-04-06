import {
  LayoutDashboard,
  Building2,
  Facebook,
  Sparkles,
  BookMarked,
  CheckCircle2,
  TrendingUp,
  Users,
  CreditCard,
  ShieldCheck,
  Calendar
  
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    section: 'Principal',
    items: [
      {
        label: 'Tableau de bord',
        href: '/overview',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    section: 'Gestion',
    items: [
      {
        label: 'Organisations',
        href: '/organizations',
        icon: Building2,
      },
      {
        label: 'Pages Facebook',
        href: '/pages',
        icon: Facebook,
      },
    ],
  },
 
  {
    section: 'Publication',
    items: [
      {
        label: 'Planificateur',
        href: '/posts',
        icon: Calendar,
      },
      {
        label: 'Posts publiés',
        href: '/published',
        icon: CheckCircle2,
      },
    ],
  },
   {
    section: 'Contenu',
    items: [
      {
        label: 'Générateur IA',
        href: '/ai',
        icon: Sparkles,
      },
      {
        label: 'Modèles',
        href: '/templates',
        icon: BookMarked,
      },
    ],
  },
  {
    section: 'Analyses',
    items: [
      {
        label: 'Analyses',
        href: '/analytics',
        icon: TrendingUp,
      },
    ],
  },
  {
    section: 'Administration',
    adminOnly: true,            
    items: [
      {
        label: 'Utilisateurs',
        href: '/admin/users',
        icon: Users,
      },
      {
        label: 'Plans',
        href: '/admin/plans',
        icon: CreditCard,
      },
    ],
  },
];

export const SCHEDULE_FREQUENCY = {
  DAILY: 'daily' as const,
  WEEKLY: 'weekly' as const,
  MONTHLY: 'monthly' as const,
};

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  success: 'bg-green-100 text-green-800',
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};