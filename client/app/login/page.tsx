'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { googleLogin, isLoading, error } = useAuth();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      // Mock token — TODO: remplacer par le vrai token Google OAuth
      const mockGoogleToken = "mock_google_token_feosync";
      await googleLogin(mockGoogleToken);
      toast({ title: 'Connexion réussie', description: 'Bienvenue sur FeoSync !' });
      router.push('/dashboard');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.message || 'Échec de la connexion', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8 space-y-6">

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              FS
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">FeoSync</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Plateforme de gestion des réseaux sociaux
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm gap-3 h-11"
          >
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {isLoading ? 'Connexion en cours...' : 'Continuer avec Google'}
          </Button>

          
        </div>
      </Card>
    </div>
  );
}