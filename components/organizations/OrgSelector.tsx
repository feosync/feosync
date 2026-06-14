'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganisations, useCreateOrganisation } from '@/hooks/useOrganisations'
import { OrgDialog } from '@/components/organizations/OrgDialog'
import type { CreateOrgRequest } from '@/lib/api/types'
import { checkCanCreateOrg } from '@/lib/api/plan-limits'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import type { ScopeFilter } from './OrgScopeFilter'

interface OrganisationSelectorProps {
  value: string | null
  onChange: (orgId: string) => void
  placeholder?: string
  scope?: ScopeFilter
}

export function OrganisationSelector({
  value,
  onChange,
  placeholder = "Sélectionner une organisation...",
  scope = "owned",
}: OrganisationSelectorProps) {
  const [open, setOpen]           = useState(false)
  const [page, setPage]           = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: userDetail } = useCurrentUserDetail()

  const { data, isLoading, isPlaceholderData } = useOrganisations({ page, page_size: 10, scope })
  const createMutation = useCreateOrganisation()

  const organisations = data?.items ?? []
  const totalPages    = data?.total_pages ?? 1

  useEffect(() => {
    if (!value && organisations.length > 0 && !isPlaceholderData) {
      onChange(organisations[0].id)
    }
  }, [organisations, value, onChange, isPlaceholderData])

  const selectedOrg = organisations.find(org => org.id === value)

  const handleOpenCreateOrg = () => {
    if (!checkCanCreateOrg(userDetail)) return
    setOpen(false)
    setDialogOpen(true)
  }

  const handleCreate = async (data: CreateOrgRequest) => {
    const newOrg = await createMutation.mutateAsync(data)
    setDialogOpen(false)
    onChange(newOrg.id)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between "
          >
            {selectedOrg ? (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="truncate">{selectedOrg.name}</span>
              </div>
            ) : (
              <span>{placeholder}</span>
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
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <>
                  {organisations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="w-10 h-10 bg-slate-100  rounded-full flex items-center justify-center mb-2.5">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-[13px] font-medium text-foreground mb-1">
                        Aucune organisation
                      </p>
                      <p className="text-[12px] text-muted-foreground mb-3">
                        Créez votre première organisation pour commencer
                      </p>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground gap-1.5 text-[12px]"
                        onClick={handleOpenCreateOrg}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Créer une organisation
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>Aucune organisation trouvée.</CommandEmpty>
                      <CommandGroup>
                        {organisations.map(org => (
                          <CommandItem
                            key={org.id}
                            value={org.name}
                            onSelect={() => { onChange(org.id); setOpen(false) }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Check className={`mr-2 h-4 w-4 ${value === org.id ? 'opacity-100' : 'opacity-0'}`} />
                              <span className="truncate">{org.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="border-t p-2 flex items-center justify-between text-sm">
                          <Button
                            variant="ghost" size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                          >
                            Précédent
                          </Button>
                          <span className="text-muted-foreground">Page {page} sur {totalPages}</span>
                          <Button
                            variant="ghost" size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          >
                            Suivant
                          </Button>
                        </div>
                      )}

                      {/* Lien rapide créer */}
                      <div className="border-t p-2">
                        <Button
                          variant="ghost" size="sm"
                          className="w-full justify-start gap-2 text-[12px] text-muted-foreground hover:text-primary"
                          onClick={handleOpenCreateOrg}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Nouvelle organisation
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <OrgDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />
    </>
  )
}