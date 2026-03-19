'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OrgDialog } from '@/components/organizations/OrgDialog';
import { OrgTable } from '@/components/organizations/OrgTable';
import { orgService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/lib/mockData';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const orgs = await orgService.getOrganizations();
      setOrganizations(orgs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: { name: string; description: string }) => {
    try {
      const newOrg = await orgService.createOrganization(data);
      setOrganizations([...organizations, newOrg]);
      setDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create organization',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: { name: string; description: string }) => {
    if (!editingOrg) return;
    try {
      const updated = await orgService.updateOrganization(editingOrg.id, data);
      if (updated) {
        setOrganizations(
          organizations.map((org) => (org.id === editingOrg.id ? updated : org))
        );
      }
      setDialogOpen(false);
      setEditingOrg(null);
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update organization',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;
    try {
      await orgService.deleteOrganization(id);
      setOrganizations(organizations.filter((org) => org.id !== id));
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete organization',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingOrg(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your organizations and their settings
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingOrg(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Organization
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-64" />
        </Card>
      ) : organizations.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No organizations yet. Create one to get started!
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </Card>
      ) : (
        <Card>
          <OrgTable
            organizations={organizations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      )}

      {/* Dialog */}
      <OrgDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingOrg ? handleUpdate : handleCreate}
        initialData={editingOrg || undefined}
      />
    </div>
  );
}
