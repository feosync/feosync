import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { FacebookPageResponse } from '@/lib/api/types'

interface Props {
  page: FacebookPageResponse | null
  isDeleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PageDeleteDialog({ page, isDeleting, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={!!page} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Déconnecter la page
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Êtes-vous sûr de vouloir déconnecter{' '}
            <span className="font-medium text-foreground">{page?.page_name}</span>
            {' '}? Les posts planifiés sur cette page seront affectés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-slate-200 ">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground border-0"
          >
            Déconnecter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}