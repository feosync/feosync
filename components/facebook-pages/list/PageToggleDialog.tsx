import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { FacebookPageResponse } from '@/lib/api/types'

interface Props {
  page: FacebookPageResponse | null
  isToggling?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PageToggleDialog({ page, isToggling, onConfirm, onCancel }: Props) {
  const isActive = page?.is_active

  return (
    <AlertDialog open={!!page} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {isActive ? 'Désactiver la page' : 'Activer la page'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {isActive ? 'Désactiver' : 'Activer'}{' '}
            <span className="font-medium text-foreground">{page?.page_name}</span>
            {' '}?{' '}
            {isActive
              ? 'Les publications planifiées seront suspendues.'
              : 'Les publications reprendront normalement.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-slate-200 ">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isToggling}
            className={isActive
              ? 'bg-warning text-warning-foreground border-0'
              : 'bg-primary text-primary-foreground border-0'}
          >
            {isActive ? 'Désactiver' : 'Activer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}