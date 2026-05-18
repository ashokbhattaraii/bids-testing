'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Loader2, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useGoogleLogin } from '@react-oauth/google';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: 'Google sign-in was cancelled.',
  invalid_state: 'Sign-in request expired or was tampered with. Please try again.',
  token_exchange_failed: 'Could not complete sign-in with Google. Please try again.',
  no_email: 'Google did not provide an email address. Please try again.',
  not_authorized: 'Your account is not registered in this system. Contact an administrator.',
  account_deactivated: 'Your account has been deactivated. Contact an administrator.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle the OAuth redirect back from the API
  useEffect(() => {
    const token = searchParams.get('token');
    const errorCode = searchParams.get('error');

    if (token) {
      setIsLoading(true);
      loginWithToken(token)
        .then(() => router.push('/'))
        .catch(() => {
          setError('Sign-in failed. Please try again.');
          setIsLoading(false);
        });
      return;
    }

    if (errorCode) {
      setError(OAUTH_ERROR_MESSAGES[errorCode] ?? 'Sign-in failed. Please try again.');
      // Remove the error param from the URL without reloading
      router.replace('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${ROUTES.base}${ROUTES.auth.googleToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });
        const data = await res.json() as { data?: { token: string }; message?: string };
        if (!res.ok) {
          const code = (data as { error?: string }).error ?? 'unknown';
          setError(OAUTH_ERROR_MESSAGES[code] ?? data.message ?? 'Sign-in failed. Please try again.');
          setIsLoading(false);
          return;
        }
        await loginWithToken(data.data!.token);
        router.push('/');
      } catch {
        setError('Sign-in failed. Please try again.');
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed. Please try again.');
    },
  });

  const handleGoogleSignIn = () => {
    googleLogin();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-secondary via-secondary to-[#457B9D]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-secondary-foreground">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Droplet className="h-9 w-9 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hamro Life Bank</h1>
              <p className="text-secondary-foreground/80">Blood Dispatch System</p>
            </div>
          </div>
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Saving Lives,<br />One Drop at a Time
            </h2>
            <p className="text-lg text-secondary-foreground/80 leading-relaxed">
              Efficiently manage blood requests, coordinate with donors, and ensure timely delivery to those in need.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-secondary-foreground/10 rounded-xl p-4 backdrop-blur">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-secondary-foreground/80">Active Donors</div>
              </div>
              <div className="bg-secondary-foreground/10 rounded-xl p-4 backdrop-blur">
                <div className="text-3xl font-bold text-accent">1200+</div>
                <div className="text-sm text-secondary-foreground/80">Lives Saved</div>
              </div>
              <div className="bg-secondary-foreground/10 rounded-xl p-4 backdrop-blur">
                <div className="text-3xl font-bold text-secondary-foreground">50+</div>
                <div className="text-sm text-secondary-foreground/80">Hospitals</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Droplet className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Hamro Life Bank</h1>
              <p className="text-xs text-muted-foreground">Blood Dispatch System</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-card">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl font-bold text-foreground">Welcome back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium text-base flex items-center gap-3"
                onClick={handleGoogleSignIn}
              >
                {/* Google "G" logo */}
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

