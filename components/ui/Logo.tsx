'use client'

import Image from 'next/image'
import { useDarkMode } from '@/hooks/useDarkMode'
import { LOGO } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LogoProps {
  iconClassName?: string
  logoClassName?: string
  priority?: boolean
}

export function Logo({ iconClassName, logoClassName, priority }: LogoProps) {
  const { dark } = useDarkMode()

  return (
    <>
      <Image
        src={dark ? LOGO.ICON_DARK : LOGO.ICON_LIGHT}
        alt="FeoSync"
        width={28}
        height={28}
        priority={priority}
        className={cn('md:hidden size-7', iconClassName)}
      />
      <Image
        src={dark ? LOGO.DARK : LOGO.LIGHT}
        alt="FeoSync"
        width={240}
        height={80}
        priority={priority}
        className={cn('hidden md:block h-16 w-auto', logoClassName)}
      />
    </>
  )
}
