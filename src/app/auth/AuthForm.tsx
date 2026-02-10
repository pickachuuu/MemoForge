'use client';

import { useState } from 'react';
import Button from '@/component/ui/Button';
import Card from '@/component/ui/Card';
import { GithubIcon, ChromeIcon } from 'hugeicons-react';
import { handleGithubLogin, handleGoogleLogin } from '@/hook/useAuthActions';

export default function AuthForm() {
  const [error, setError] = useState<string | null>(null);

  const handleGithub = async () => {
    try {
      await handleGithubLogin();
    } catch (e: any) {
      setError(e?.message || 'An error occurred');
    }
  };

  const handleGoogle = async () => {
    try{
      await handleGoogleLogin();
    } catch (e: any ){
      setError(e.message || 'An error occured');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" size="lg" className="text-center">
          <Card.Header className="space-y-2 my-2">
            <h1 className="text-3xl font-bold text-foreground">Sign in to Verso</h1>
            <p className="text-foreground-muted">Continue with your account</p>
          </Card.Header>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          <Card.Content className="space-y-4">
            <Button
              onClick={handleGithub}
              variant="outline"
              size="lg"
              className="w-full justify-center gap-2"
            >
              <GithubIcon className="w-5 h-5" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-2"
              onClick={handleGoogle}
            >
              <ChromeIcon className="w-5 h-5" />
              Continue with Google
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
} 