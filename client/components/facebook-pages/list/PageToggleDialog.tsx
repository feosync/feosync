import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { FacebookPage } from '@/lib/api/types'

interface Props {
  page: FacebookPage | null
  isToggling?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PageToggleDialog({ page, isToggling, onConfirm, onCancel }: Props) {
  const isActive = page?.is_active

  return (
    <AlertDialog open={!!page} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-white">
            {isActive ? 'Désactiver la page' : 'Activer la page'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
            {isActive ? 'Désactiver' : 'Activer'}{' '}
            <span className="font-medium text-slate-900 dark:text-white">{page?.page_name}</span>
            {' '}?{' '}
            {isActive
              ? 'Les publications planifiées seront suspendues.'
              : 'Les publications reprendront normalement.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-slate-200 dark:border-slate-700">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isToggling}
            className={isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-white border-0'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-0'}
          >
            {isActive ? 'Désactiver' : 'Activer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}