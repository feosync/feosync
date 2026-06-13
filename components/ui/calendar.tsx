'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        root: 'w-fit',
        months: 'flex flex-col sm:flex-row gap-4 relative',
        month: 'flex flex-col gap-4 w-full',
        nav: 'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
        nav_button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-7 p-0 aria-disabled:opacity-50',
        ),
        nav_button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-7 p-0 aria-disabled:opacity-50',
        ),
        caption_label: 'flex items-center justify-center h-7 w-full px-7 text-sm font-medium',
        caption_dropdowns: 'flex items-center text-sm font-medium justify-center h-7 gap-1.5',
        dropdown: 'relative rounded-md border border-input has-focus:border-ring',
        dropdown_icon: 'hidden',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
        row: 'flex w-full mt-2',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'relative w-full h-full p-0 font-normal aria-selected:opacity-100 text-center group/day aspect-square select-none',
        ),
        day_range_start: 'rounded-l-md bg-accent',
        day_range_middle: 'rounded-none bg-accent',
        day_range_end: 'rounded-r-md bg-accent',
        day_today: 'bg-accent text-accent-foreground rounded-md',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50',
        day_hidden: 'invisible',
        weeknumber: 'text-[0.8rem] text-muted-foreground select-none',
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
