"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Organisation } from "@/lib/api/types";
import { OrgActionsMenu } from "./OrgActionsMenu";
import { sectorLabels, toneLabels } from "./labels";
import { ManageSocialMedia } from "./socialMedia";
import { useState } from "react";

interface Props {
  org: Organisation;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// ─── Vue mobile : carte ───────────────────────────────────────────────────────

function OrgMobileCard({ org, onView, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={onView}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:bg-accent/30 transition-all duration-200 cursor-pointer"
    >
      {/* ── En-tête : nom + actions ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {org.brand_color && (
            <div
              className="w-3 h-3 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: org.brand_color }}
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{org.name}</p>
            {org.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {org.description}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <OrgActionsMenu org={org} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      {/* ── Badges secteur + ton ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-0 text-xs"
        >
          {sectorLabels[org.sector] || org.sector}
        </Badge>

        {org.tone && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-border">·</span>
            {toneLabels[org.tone] || org.tone}
          </span>
        )}
      </div>

      {/* ── Séparateur ──────────────────────────────────────────────────── */}
      <div className="h-px bg-border" />

      {/* ── Pied : couleur de marque + date + réseaux ───────────────────── */}
      <div
        className="flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Couleur de marque + date */}
        <div className="flex flex-col gap-0.5 min-w-0">
          {org.brand_color ? (
            <div className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                style={{ backgroundColor: org.brand_color }}
              />
              <span className="text-xs text-muted-foreground font-mono truncate">
                {org.brand_color}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
          <span className="text-xs text-muted-foreground">
            {format(new Date(org.created_at), "d MMM yyyy", { locale: fr })}
          </span>
        </div>

        {/* Réseaux sociaux — version compacte pour la carte mobile */}
        <div className="shrink-0">
          <MobileSocialButton orgId={org.id} open={open} onOpenChange={setOpen} />
        </div>
      </div>
    </div>
  );
}

// ─── Bouton social compact pour la carte mobile ───────────────────────────────
//
// On wrape ManageSocialMedia dans un conteneur à taille fixe pour que le
// positionnement `absolute` interne ne déborde pas hors de la carte.

function MobileSocialButton({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <div
      className="relative w-24 h-10 flex items-center justify-end"
      // On stop la propagation ici pour ne pas déclencher onView
      onClick={(e) => e.stopPropagation()}
    >
      {/*
        ManageSocialMedia rend en interne :
        - les icônes empilées (absolute, positionnées depuis la droite)
        - le bouton "+" (absolute right-2)
        - les dialogs (portals, hors flux)

        Le conteneur 96px de large + overflow-visible laisse les icônes
        déborder légèrement à gauche sans perturber le layout de la carte.
      */}
      <ManageSocialMedia
        key={`${orgId}-mobile`}
        open={open}
        onOpenChange={onOpenChange}
        orgId={orgId}
      />
    </div>
  );
}

// ─── Vue desktop : ligne de tableau ──────────────────────────────────────────

function OrgTableRow({ org, onView, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <TableRow
      onClick={onView}
      className="border-border hover:bg-accent cursor-pointer transition-colors"
    >
      {/* Nom */}
      <TableCell>
        <div className="flex items-center gap-2.5">
          {org.brand_color && (
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: org.brand_color }}
            />
          )}
          <div>
            <p className="font-medium text-foreground">{org.name}</p>
            {org.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                {org.description}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Secteur */}
      <TableCell>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-0 text-xs"
        >
          {sectorLabels[org.sector] || org.sector}
        </Badge>
      </TableCell>

      {/* Ton */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {toneLabels[org.tone] || org.tone}
        </span>
      </TableCell>

      {/* Couleur de marque */}
      <TableCell>
        {org.brand_color ? (
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border border-border"
              style={{ backgroundColor: org.brand_color }}
            />
            <span className="text-xs text-muted-foreground font-mono">
              {org.brand_color}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Date */}
      <TableCell className="text-sm text-muted-foreground">
        {format(new Date(org.created_at), "d MMM yyyy", { locale: fr })}
      </TableCell>

      {/* Réseaux + actions */}
      <TableCell className="text-right">
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <ManageSocialMedia
            key={`${org.id}-desktop`}
            open={open}
            onOpenChange={setOpen}
            orgId={org.id}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Export principal : bascule mobile / desktop ──────────────────────────────

export function OrgDesktopRow(props: Props) {
  return (
    <>
      {/* Mobile : visible en dessous de md */}
      <tr className="md:hidden">
        <td colSpan={6} className="p-0 pb-2 px-2">
          <OrgMobileCard {...props} />
        </td>
      </tr>

      {/* Desktop : visible à partir de md */}
      <OrgTableRow {...props} />
    </>
  );
}