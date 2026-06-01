import {
  faBookmark,
  faUsers,
  faCreditCard,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook as faFacebookBrand, faSquareFacebook } from '@fortawesome/free-brands-svg-icons';
import { faChartColumn, faSquareCheck, faChartLine, faBuildingCircleArrowRight } from '@fortawesome/free-solid-svg-icons'

export const NAVIGATION_ITEMS = [
  {
    section: 'Principal',
    items: [
      {
        label: 'Tableau de bord',
        href: '/overview',
        icon: faChartColumn,
      },
    ],
  },
  {
    section: 'Gestion',
    items: [
      {
        label: 'Organisations',
        href: '/organizations',
        icon: faBuildingCircleArrowRight,
      },
      {
        label: 'Pages Facebook',
        href: '/pages',
        icon: faSquareFacebook,
      },
    ],
  },
 
  {
    section: 'Publication',
    items: [
      {
        label: 'Planificateur',
        href: '/posts',
        icon: faCalendar,
      },
      {
        label: 'Posts publiés',
        href: '/published',
        icon: faSquareCheck,
      },
    ],
  },
  //  {
  //   section: 'Contenu',
  //   items: [
  //     {
  //       label: 'Modèles',
  //       href: '/templates',
  //       icon: faBookmark,
  //     },
  //   ],
  // },
  {
    section: 'Analyses',
    items: [
      {
        label: 'Analyses',
        href: '/analytics',
        icon: faChartLine,
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
        icon: faUsers,
      },
      {
        label: 'Plans',
        href: '/admin/plans',
        icon: faCreditCard,
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