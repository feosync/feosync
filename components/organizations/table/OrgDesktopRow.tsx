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
      className="group relative flex flex-col gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
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
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {org.name}
            </p>
            {org.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {org.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions : stop propagation pour ne pas déclencher onView */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <OrgActionsMenu org={org} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      {/* ── Badges secteur + ton ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0 text-xs"
        >
          {sectorLabels[org.sector] || org.sector}
        </Badge>

        {org.tone && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {toneLabels[org.tone] || org.tone}
          </span>
        )}
      </div>

      {/* ── Séparateur ──────────────────────────────────────────────────── */}
      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      {/* ── Pied : couleur + date + réseaux ─────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Couleur de marque */}
        {org.brand_color ? (
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700"
              style={{ backgroundColor: org.brand_color }}
            />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              {org.brand_color}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
        )}

        {/* Date + réseaux sociaux */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
            {format(new Date(org.created_at), "d MMM yyyy", { locale: fr })}
          </span>
          <ManageSocialMedia
            key={`${org.id}-mobile`}
            open={open}
            onOpenChange={setOpen}
            orgId={org.id}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Vue desktop : ligne de tableau ──────────────────────────────────────────

function OrgTableRow({ org, onView, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <TableRow
      onClick={onView}
      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
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
            <p className="font-medium text-slate-900 dark:text-white">
              {org.name}
            </p>
            {org.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
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
          className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0 text-xs"
        >
          {sectorLabels[org.sector] || org.sector}
        </Badge>
      </TableCell>

      {/* Ton */}
      <TableCell>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {toneLabels[org.tone] || org.tone}
        </span>
      </TableCell>

      {/* Couleur de marque */}
      <TableCell>
        {org.brand_color ? (
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"
              style={{ backgroundColor: org.brand_color }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {org.brand_color}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </TableCell>

      {/* Date */}
      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
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
          {/* <OrgActionsMenu org={org} onEdit={onEdit} onDelete={onDelete} /> */}
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