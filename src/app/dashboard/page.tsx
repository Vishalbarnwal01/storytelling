'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Upload as UploadIcon,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Song {
  id: number;
  title: string;
  uploadedAt: string;
  status: 'approved' | 'pending' | 'rejected';
  views?: number;
}

interface User {
  id: number;
  email: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ComponentType<any>; 
  color: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const getStatusBadge = (status: Song['status']) => {
  const variants: Record<Song['status'], any> = {
    approved: 'default',
    pending: 'secondary',
    rejected: 'destructive',
  };

  const labels: Record<Song['status'], string> = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Fetch user's songs from API
    fetchUserSongs(parsedUser.id);

    // Refetch songs when user returns from upload
    const handleStorageChange = () => {
      fetchUserSongs(parsedUser.id);
    };

    window.addEventListener('focus', handleStorageChange);
    return () => window.removeEventListener('focus', handleStorageChange);
  }, [router]);

  const fetchUserSongs = async (userId: number) => {
    try {
      const response = await fetch(`/api/user/songs?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSongs(data.songs || []);
      } else {
        console.error('Failed to fetch songs');
        setSongs([]);
      }
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      setSongs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (user) {
      setIsRefreshing(true);
      await fetchUserSongs(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-6">
          <div className="space-y-4">
            <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalSongs = songs.length;
  const approvedSongs = songs.filter(s => s.status === 'approved').length;
  const pendingSongs = songs.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold">My Dashboard</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild>
              <Link href="/upload">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload New Song
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Uploads"
            value={totalSongs}
            icon={UploadIcon}
            color="text-blue-500"
          />
          <StatCard
            title="Approved Songs"
            value={approvedSongs}
            icon={CheckCircle}
            color="text-green-500"
          />
          <StatCard
            title="Pending Review"
            value={pendingSongs}
            icon={Clock}
            color="text-yellow-500"
          />
        </div>

        {/* Songs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {songs.length === 0 ? (
              <div className="py-12 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  Currently, no songs uploaded
                </p>
                <p className="text-muted-foreground mb-6">
                  Kindly upload your first audio story to get started!
                </p>
                <Button asChild size="lg">
                  <Link href="/upload">
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Your First Song
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {songs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/story/${song.id}`}
                            className="hover:underline text-accent"
                          >
                            {song.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {new Date(song.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(song.status)}</TableCell>
                        <TableCell className="text-right">
                          {song.views || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
