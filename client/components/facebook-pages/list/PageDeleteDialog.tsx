import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { FacebookPage } from '@/lib/api/types'

interface Props {
  page: FacebookPage | null
  isDeleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PageDeleteDialog({ page, isDeleting, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={!!page} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-white">
            Déconnecter la page
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
            Êtes-vous sûr de vouloir déconnecter{' '}
            <span className="font-medium text-slate-900 dark:text-white">{page?.page_name}</span>
            {' '}? Les posts planifiés sur cette page seront affectés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-slate-200 dark:border-slate-700">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            Déconnecter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}