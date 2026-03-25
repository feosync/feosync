'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganisations } from '@/hooks/useOrganisations'
import type { Organisation } from '@/lib/api/types'

interface OrganisationSelectorProps {
  value: string | null
  onChange: (orgId: string) => void
  placeholder?: string
}

export function OrganisationSelector({
  value,
  onChange,
  placeholder = "Sélectionner une organisation...",
}: OrganisationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)


  const { data, isLoading } = useOrganisations({
    page,
    page_size: 10,
  })

  const organisations = data?.items ?? []
  const totalPages = data?.total_pages ?? 1

  useEffect(() => {
    if (!value && organisations.length > 0) {
      onChange(organisations[0].id)
    }
  }, [organisations, value, onChange])

  const selectedOrg = organisations.find((org) => org.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedOrg ? (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="truncate">{selectedOrg.name}</span>
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une organisation..." />

          <CommandList>
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <CommandEmpty>Aucune organisation trouvée.</CommandEmpty>
                <CommandGroup>
                  {organisations.map((org) => (
                    <CommandItem
                      key={org.id}
                      value={org.name}
                      onSelect={() => {
                        onChange(org.id)
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            value === org.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <span className="truncate">{org.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                {/* Pagination dans le dropdown */}
                {totalPages > 1 && (
                  <div className="border-t p-2 flex items-center justify-between text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Précédent
                    </Button>
                    <span className="text-slate-500">
                      Page {page} sur {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}