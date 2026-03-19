'use client';

import { Trash2, ExternalLink, ToggleLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FacebookPage } from '@/lib/mockData';

interface PagesListProps {
  pages: FacebookPage[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PagesList({ pages, onToggle, onDelete }: PagesListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-semibold text-slate-900 dark:text-white">
                {page.pageName}
              </TableCell>
              <TableCell>
                <a
                  href={page.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {page.pageUrl.substring(0, 30)}...
                  <ExternalLink className="w-3 h-3" />
                </a>
              </TableCell>
              <TableCell>
                <Badge
                  variant={page.isActive ? 'default' : 'secondary'}
                  className={
                    page.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                      : ''
                  }
                >
                  {page.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggle(page.id)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <ToggleLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(page.id)}
                    className="hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
