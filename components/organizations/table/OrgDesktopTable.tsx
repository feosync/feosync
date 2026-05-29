"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Organisation } from "@/lib/api/types";
import { OrgDesktopRow } from "./OrgDesktopRow";

interface Props {
  organisations: Organisation[];
  onView: (org: Organisation) => void;
  onEdit: (org: Organisation) => void;
  onDelete: (org: Organisation) => void;
}

export function OrgDesktopTable({ organisations, onView, onEdit, onDelete }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {["Organisation", "Secteur", "Ton", "Couleur", "Créée le"].map((col) => (
              <TableHead
                key={col}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {col}
              </TableHead>
            ))}
            <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organisations.map((org) => (
            <OrgDesktopRow
              key={org.id}
              org={org}
              onView={() => onView(org)}
              onEdit={() => onEdit(org)}
              onDelete={() => onDelete(org)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}