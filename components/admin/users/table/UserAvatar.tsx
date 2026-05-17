import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { initials } from './utils'

interface Props {
  name: string
}

export function UserAvatar({ name }: Props) {
  return (
    <Avatar className="w-8 h-8">
      <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}