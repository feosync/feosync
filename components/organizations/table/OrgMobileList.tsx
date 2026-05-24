"use client"
import type { Organisation } from "@/lib/api/types";
import { OrgCard } from "./OrgCard";
import { ManageSocialMedia } from "./socialMedia";
import { useState } from "react";

interface Props {
  organisations: Organisation[];
  onEdit: (org: Organisation) => void;
  onDelete: (org: Organisation) => void;
}

export function OrgMobileList({ organisations, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {organisations.map((org) => (
        <OrgCard
          key={org.id}
          org={org}
          onEdit={() => onEdit(org)}
          onDelete={() => onDelete(org)}
        />
      ))}
    </div>
  );
}
