import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { FacebookPage, FacebookPageResponse } from "@/lib/api/types";
import { PageRowActions } from "./PageRowActions";

interface Props {
  page: FacebookPageResponse;
  insightsExpanded: boolean;
  onToggleInsights: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onSyncInsights: () => void;
  isToggling?: boolean;
  isDeleting?: boolean;
  isSyncing?: boolean;
}

export function PagesDesktopRow({
  page,
  insightsExpanded,
  onToggleInsights,
  onToggle,
  onDelete,
  onSyncInsights,
  isToggling,
  isDeleting,
  isSyncing,
}: Props) {
  return (
    <TableRow className="border-border hover:bg-muted/40 transition-colors">
      {/* Page name */}
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
            {page?.fb_page_picture ? (
              <img
                src={page.fb_page_picture}
                alt={page.page_name}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-xl  object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                f
              </div>
            )}
          </div>
          <span className="font-medium text-foreground">{page.page_name}</span>
        </div>
      </TableCell>

      {/* ID Facebook */}
      <TableCell>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md">
          {page.fb_page_id}
        </span>
      </TableCell>

      {/* Statut */}
      <TableCell>
        <PageStatusBadge isActive={page.is_active} />
      </TableCell>

      {/* Dernière sync */}
      <TableCell className="text-sm text-muted-foreground">
        {page.last_sync_at ? (
          format(new Date(page.last_sync_at), "d MMM yyyy HH:mm", {
            locale: fr,
          })
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <PageRowActions
          page={page}
          insightsExpanded={insightsExpanded}
          onToggleInsights={onToggleInsights}
          onToggle={onToggle}
          onDelete={onDelete}
          onSyncInsights={onSyncInsights}
          isToggling={isToggling}
          isDeleting={isDeleting}
          isSyncing={isSyncing}
        />
      </TableCell>
    </TableRow>
  );
}

// ── Sous-composants visuels ───────────────────────────────────────────────────

// Couleur de marque Facebook — intentionnellement hors tokens
export function FacebookIcon() {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center
                 text-foreground text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: "#1877F2", fontFamily: "Georgia, serif" }}
    >
      f
    </div>
  );
}

export function PageStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? "bg-success/10 text-success border-0 font-medium"
          : "bg-muted text-muted-foreground border-0 font-medium"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
