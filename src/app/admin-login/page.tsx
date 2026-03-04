'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in as admin
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      router.push('/kwadmin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter both email and password',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin session
        localStorage.setItem('adminSession', JSON.stringify(data.admin));
        toast({
          title: 'Success',
          description: 'Admin login successful',
        });
        router.push('/kwadmin');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Invalid credentials',
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log in',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-accent" />
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Sign in with your admin credentials
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Not an admin? 
              <Link href="/login" className="text-accent hover:underline ml-1">
                User Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
