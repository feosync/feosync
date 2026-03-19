'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully',
      });
      logout();
      router.push('/login');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Your Profile
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {user?.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            This is a demo account with mock data. All changes are not persistent.
          </p>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Receive email updates about your posts
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Weekly Summary</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get a weekly summary of your performance
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Toggle dark mode theme
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* Account Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Account
        </h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* About Section */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
          About FeoSync
        </h2>
        <div className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
          <p>FeoSync v1.0.0 - Demo Application</p>
          <p>Build with Next.js, TypeScript, Tailwind CSS, and Recharts</p>
          <p>All data is mock and for demonstration purposes only.</p>
        </div>
      </Card>
    </div>
  );
}
