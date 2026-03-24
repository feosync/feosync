import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { UserSummary } from '@/lib/api/types'

interface Props {
  user: UserSummary | null
  onClose: () => void
  onConfirm: (id: string) => void
}

export function DeleteUserDialog({ user, onClose, onConfirm }: Props) {
  return (
    <AlertDialog open={!!user} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. L'utilisateur{' '}
            <span className="font-semibold">{user?.name}</span> ({user?.email}) sera
            définitivement supprimé.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => { if (user) onConfirm(user.id) }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}