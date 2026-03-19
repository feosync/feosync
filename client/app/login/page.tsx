'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('demo@feosync.com');
  const [password, setPassword] = useState('demo123');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }

    try {
      await login(email, password);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to login';
      setFormError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">FeoSync</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Social Media Automation Platform
            </p>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm">
              <p className="text-red-800 dark:text-red-200">{formError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <Input
                type="email"
                placeholder="demo@feosync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Input
                type="password"
                placeholder="demo123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Demo Credentials
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              Email: demo@feosync.com<br />
              Password: demo123
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            <p>This is a demo application with mock data</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
