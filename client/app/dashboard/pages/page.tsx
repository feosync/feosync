'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { fbPagesService, orgService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PagesList } from '@/components/facebook-pages/PagesList';
import { ConnectPageDialog } from '@/components/facebook-pages/ConnectPageDialog';
import type { FacebookPage } from '@/lib/mockData';

export default function FacebookPagesPage() {
  const { user } = useAuth();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [orgs, allPages] = await Promise.all([
        orgService.getOrganizations(),
        fbPagesService.getPagesByOrganization(user?.id || ''),
      ]);
      setOrganizations(orgs);
      setPages(allPages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (data: any) => {
    try {
      const newPage = await fbPagesService.connectPage({
        organizationId: data.organizationId,
        pageId: data.pageId,
        pageName: data.pageName,
        pageUrl: data.pageUrl,
      });
      setPages([...pages, newPage]);
      setDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Facebook page connected successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect page',
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await fbPagesService.togglePageActive(id);
      if (updated) {
        setPages(pages.map((p) => (p.id === id ? updated : p)));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle page',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this page?')) return;
    try {
      await fbPagesService.deletePage(id);
      setPages(pages.filter((p) => p.id !== id));
      toast({
        title: 'Success',
        description: 'Page disconnected successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Facebook Pages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Connect and manage your Facebook pages
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Connect Page
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-64" />
        </Card>
      ) : pages.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No pages connected yet. Connect your first Facebook page!
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Page
          </Button>
        </Card>
      ) : (
        <Card>
          <PagesList
            pages={pages}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </Card>
      )}

      <ConnectPageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleConnect}
        organizations={organizations}
      />
    </div>
  );
}
