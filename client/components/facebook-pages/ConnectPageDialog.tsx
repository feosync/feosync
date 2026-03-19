'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

interface ConnectPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  organizations: any[];
}

export function ConnectPageDialog({
  open,
  onOpenChange,
  onSubmit,
  organizations,
}: ConnectPageDialogProps) {
  const [organizationId, setOrganizationId] = useState('');
  const [pageId, setPageId] = useState('');
  const [pageName, setPageName] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !pageId || !pageName) return;

    setIsLoading(true);
    try {
      await onSubmit({
        organizationId,
        pageId,
        pageName,
        pageUrl: pageUrl || `https://facebook.com/${pageId}`,
      });
      setOrganizationId('');
      setPageId('');
      setPageName('');
      setPageUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthClick = () => {
    setShowOAuth(true);
    setTimeout(() => {
      setShowOAuth(false);
      setPageId('page_' + Math.floor(Math.random() * 10000));
      setPageName('Facebook Page ' + Math.floor(Math.random() * 100));
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Facebook Page</DialogTitle>
        </DialogHeader>

        {!showOAuth ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Organization
              </label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={handleOAuthClick}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!organizationId || isLoading}
            >
              Connect with Facebook
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-2 text-slate-600 dark:text-slate-400">
                  Or enter manually
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Page Name
              </label>
              <Input
                placeholder="My Facebook Page"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Page ID
              </label>
              <Input
                placeholder="Page ID from Facebook"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Page URL (optional)
              </label>
              <Input
                placeholder="https://facebook.com/..."
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !organizationId || !pageId || !pageName}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Connecting...
                  </>
                ) : (
                  'Connect Page'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="animate-pulse">
              <Spinner className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Redirecting to Facebook login...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              (Demo: simulating OAuth flow)
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
