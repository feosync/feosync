import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Plan } from '@/lib/api/types'

interface Props {
  plan: Plan | null
  isDeleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PlanDeleteDialog({ plan, isDeleting, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={!!plan} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le plan ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le plan{' '}
            <span className="font-semibold">{plan?.name}</span>{' '}
            sera définitivement supprimé. Les utilisateurs abonnés à ce plan seront affectés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-foreground font-bold"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}