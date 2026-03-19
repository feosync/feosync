'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { templateService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { TemplateDialog } from '@/components/templates/TemplateDialog';
import type { PostTemplate } from '@/lib/mockData';

export default function TemplatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PostTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await templateService.getTemplatesByOrganization(user?.id || '');
      setTemplates(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: { title: string; content: string }) => {
    try {
      const newTemplate = await templateService.createTemplate({
        organizationId: user?.id || '',
        ...data,
      });
      setTemplates([...templates, newTemplate]);
      setDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: { title: string; content: string }) => {
    if (!editingTemplate) return;
    try {
      const updated = await templateService.updateTemplate(editingTemplate.id, data);
      if (updated) {
        setTemplates(
          templates.map((t) => (t.id === editingTemplate.id ? updated : t))
        );
      }
      setDialogOpen(false);
      setEditingTemplate(null);
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await templateService.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Post Templates
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create and manage your post templates
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingTemplate(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No templates yet. Create one to get started!
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {template.title}
                </h3>
                <Badge
                  variant="secondary"
                  className={
                    template.category === 'app'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                  }
                >
                  {template.category === 'app' ? 'App' : 'User'}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-1">
                {template.content.substring(0, 100)}...
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setDialogOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTemplate(null);
        }}
        onSubmit={editingTemplate ? handleUpdate : handleCreate}
        initialData={editingTemplate || undefined}
      />
    </div>
  );
}
