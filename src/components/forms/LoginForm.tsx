'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" role="img" aria-label="Google icon">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.302-11.127-7.781l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.136,44,30.024,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


export default function LoginForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const router = useRouter();

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState<{ [key: string]: string }>({});

  // Sign Up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpErrors, setSignUpErrors] = useState<{ [key: string]: string }>({});

  const handleGoogleAuth = async (credentialResponse: any) => {
    try {
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decodedToken = JSON.parse(jsonPayload);
      
      const { email, name, sub: googleId } = decodedToken;

      if (!email.toLowerCase().endsWith('@gmail.com') && !email.toLowerCase().endsWith('@outlook.com')) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'Only @gmail.com and @outlook.com addresses are allowed.',
        });
        return;
      }

      const response = await fetch('/api/auth/google-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, googleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Google Sign In Failed',
          description: data.error || 'An unexpected error occurred.',
        });
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('userLoggedIn'));
      toast({ title: 'Signed in with Google successfully!' });
      router.push('/');
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign In Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  useEffect(() => {
    if (window.google) {
      setIsGoogleLoaded(true);
      return;
    }
    
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsGoogleLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: '377169052223-3pp8rooi3uiln39kqguv8qbmku84iok8.apps.googleusercontent.com',
        callback: handleGoogleAuth,
      });

      // Provide a slight delay so Radix Tabs can mount the active tab content
      setTimeout(() => {
        const containerId = activeTab === 'signin' ? 'google-signin-button-signin' : 'google-signin-button-signup';
        const googleButtonContainer = document.getElementById(containerId);
        if (googleButtonContainer) {
          googleButtonContainer.innerHTML = '';
          window.google.accounts.id.renderButton(googleButtonContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
          });
        }
      }, 50);
    }
  }, [isGoogleLoaded, activeTab]);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setSignInErrors({});

    // Validation
    const errors: { [key: string]: string } = {};
    if (!signInEmail) {
      errors.email = 'Email is required';
    } else if (!signInEmail.includes('@')) {
      errors.email = 'Please enter a valid email';
    } else if (!signInEmail.toLowerCase().endsWith('@gmail.com') && !signInEmail.toLowerCase().endsWith('@outlook.com')) {
      errors.email = 'Only @gmail.com and @outlook.com addresses are allowed';
    }
    if (!signInPassword) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setSignInErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: data.error || 'An unexpected error occurred.',
        });
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('userLoggedIn'));
      setSignInEmail('');
      setSignInPassword('');
      toast({ title: 'Signed in successfully!' });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setSignUpErrors({});

    // Validation
    const errors: { [key: string]: string } = {};
    if (!signUpEmail) {
      errors.email = 'Email is required';
    } else if (!signUpEmail.includes('@')) {
      errors.email = 'Please enter a valid email';
    } else if (!signUpEmail.toLowerCase().endsWith('@gmail.com') && !signUpEmail.toLowerCase().endsWith('@outlook.com')) {
      errors.email = 'Only @gmail.com and @outlook.com addresses are allowed';
    }
    if (!signUpName || signUpName.length < 2) errors.name = 'Full name must be at least 2 characters';
    if (!signUpPassword || signUpPassword.length < 6) errors.password = 'Password must be at least 6 characters';

    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signUpEmail, name: signUpName, password: signUpPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: data.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast({ title: 'Account created successfully!' });
      
      // Auto-login after signup
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signUpEmail, password: signUpPassword }),
      });

      const loginData = await loginResponse.json();
      localStorage.setItem('user', JSON.stringify(loginData.user));
      window.dispatchEvent(new Event('userLoggedIn'));
      setSignUpEmail('');
      setSignUpName('');
      setSignUpPassword('');
      
      router.push('/');
    } catch (error: any) {    
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={onSignIn} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="off"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className={signInErrors.email ? 'border-red-500' : ''}
                />
                {signInErrors.email && <p className="text-xs text-red-500 mt-1">{signInErrors.email}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="off"
                  spellCheck="false"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className={signInErrors.password ? 'border-red-500' : ''}
                />
                {signInErrors.password && <p className="text-xs text-red-500 mt-1">{signInErrors.password}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-zinc-500">Or continue with</span>
                </div>
              </div>

              <div 
                id="google-signin-button-signin" 
                className="w-full flex justify-center"
                style={{ display: 'flex', justifyContent: 'center' }}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={onSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="off"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className={signUpErrors.email ? 'border-red-500' : ''}
                />
                {signUpErrors.email && <p className="text-xs text-red-500 mt-1">{signUpErrors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  autoComplete="off"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className={signUpErrors.name ? 'border-red-500' : ''}
                />
                {signUpErrors.name && <p className="text-xs text-red-500 mt-1">{signUpErrors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="off"
                  spellCheck="false"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className={signUpErrors.password ? 'border-red-500' : ''}
                />
                {signUpErrors.password && <p className="text-xs text-red-500 mt-1">{signUpErrors.password}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-zinc-500">Or continue with</span>
                </div>
              </div>

              <div 
                id="google-signin-button-signup" 
                className="w-full flex justify-center"
                style={{ display: 'flex', justifyContent: 'center' }}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

