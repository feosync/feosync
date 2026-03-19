'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty } from '@/components/ui/empty';
import { useToast } from '@/hooks/use-toast';
import { useOrganizations, useCreateOrganization, useDeleteOrganization } from '@/lib/api/hooks';
import { OrgTable } from '@/components/organizations/OrgTable';
import { OrgDialog } from '@/components/organizations/OrgDialog';

export default function OrganizationsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // React Query hooks
  const { data: organizations = [], isLoading, error } = useOrganizations();
  const createMutation = useCreateOrganization({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create organization',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useDeleteOrganization({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete organization',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            Error loading organizations: {error.message}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your organizations and their settings
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setIsDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Organization
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ) : organizations.length === 0 ? (
        <Empty
          title="No organizations"
          description="Create your first organization to get started"
          action={
            <Button
              onClick={() => {
                setEditingId(null);
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Organization
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <OrgTable
            organizations={organizations}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </Card>
      )}

      {/* Dialog */}
      <OrgDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
