'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setName(userData.name || '');
    setPageLoading(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess('Profile updated successfully!');
      
      // Update local storage
      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userLoggedIn'));
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Back Button */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>
              Update your name and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="mt-1 bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-sm text-foreground">Change Password</h3>
                <p className="text-xs text-muted-foreground">
                  Leave empty if you don't want to change your password
                </p>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-sm">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
