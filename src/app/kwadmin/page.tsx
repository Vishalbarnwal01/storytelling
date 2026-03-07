'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { 
  Shield, 
  Users, 
  FileText, 
  Upload as UploadIcon,
  User,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Headphones,
  Image as ImageIcon
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  email: string;
  created_at: string;
}

interface Story {
  id: number;
  userId: number;
  userEmail: string;
  title: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  views: number;
  likes: number;
  createdAt: string;
  thumbnailPath: string;
  audioPath: string;
}

interface AdminUser {
  id: number;
  email: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin-login');
      return;
    }
    
    const parsedAdmin = JSON.parse(adminSession);
    setAdminUser(parsedAdmin);

    // Fetch all users and stories
    Promise.all([fetchUsers(), fetchStories()]).then(() => {
      setIsLoading(false);
    });
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/admin/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      } else {
        console.error('Failed to fetch stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleApproveStory = async (storyId: number) => {
    try {
      setIsApproving(true);
      const response = await fetch('/api/admin/stories/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: storyId, status: 'approved' }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Story approved successfully',
        });
        // Update local state
        setStories(stories.map(s => s.id === storyId ? { ...s, status: 'approved' } : s));
        setSelectedStory(null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to approve story',
        });
      }
    } catch (error) {
      console.error('Error approving story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve story',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectStory = async (storyId: number) => {
    try {
      setIsApproving(true);
      const response = await fetch('/api/admin/stories/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: storyId, status: 'rejected' }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Story rejected',
        });
        setStories(stories.map(s => s.id === storyId ? { ...s, status: 'rejected' } : s));
        setSelectedStory(null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to reject story',
        });
      }
    } catch (error) {
      console.error('Error rejecting story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject story',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadTitle.trim() || !uploadDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields',
      });
      return;
    }

    if (!audioFileRef.current?.files?.[0]) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an audio file',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('adminId', adminUser?.id.toString() || '');
      formData.append('audioFile', audioFileRef.current.files[0]);
      
      if (thumbnailFileRef.current?.files?.[0]) {
        formData.append('thumbnailFile', thumbnailFileRef.current.files[0]);
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Story uploaded and is now live!',
        });
        // Reset form
        setUploadTitle('');
        setUploadDescription('');
        setThumbnailPreview(null);
        if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
        if (audioFileRef.current) audioFileRef.current.value = '';
        // Refresh stories
        await fetchStories();
      } else {
        const data = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to upload story',
        });
      }
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload story',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: Story['status']) => {
    const variants: Record<Story['status'], any> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
    };

    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-6">
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  const pendingStories = stories.filter(s => s.status === 'pending');
  const approvedStories = stories.filter(s => s.status === 'approved');

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="stories">
              <FileText className="mr-2 h-4 w-4" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="mt-6 space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <FileText className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingStories.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <Check className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedStories.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* All Stories */}
            <Card>
              <CardHeader>
                <CardTitle>All Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stories.map((story) => (
                    <div 
                      key={story.id} 
                      className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-accent/5 transition-colors"
                      onClick={() => setSelectedStory(story)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{story.title}</h3>
                          <p className="text-sm text-muted-foreground">{story.userEmail}</p>
                          <p className="text-sm mt-2 line-clamp-2">{story.description}</p>
                        </div>
                        <div className="ml-4">
                          {story.thumbnailPath && (
                            <div className="relative h-20 w-20">
                              <Image
                                src={`/uploads/${story.thumbnailPath}`}
                                alt={story.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(story.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            👁️ {story.views} views
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          {getStatusBadge(story.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {stories.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No stories found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Upload Story</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminUpload} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-title">Story Title</Label>
                    <Input 
                      id="admin-title" 
                      placeholder="Enter story title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-description">Description</Label>
                    <textarea 
                      id="admin-description"
                      placeholder="Enter story description"
                      className="w-full min-h-24 p-2 border rounded-md bg-background text-foreground"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-thumbnail">Thumbnail Image (Optional)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                      {thumbnailPreview ? (
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            fill
                            className="object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnailPreview(null);
                              if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div>
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5MB)</p>
                        </div>
                      )}
                      <input
                        ref={thumbnailFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (thumbnailFileRef.current) {
                            thumbnailFileRef.current.files = e.currentTarget.files;
                            handleThumbnailSelect(e as any);
                          }
                        }}
                        onClick={(e) => thumbnailFileRef.current?.click()}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => thumbnailFileRef.current?.click()}
                        disabled={isUploading}
                        className="mt-2"
                      >
                        Browse Files
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-audio">Audio File (MP3, WAV, M4A, FLAC)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                      {audioFileRef.current?.files?.[0] ? (
                        <div className="text-sm">
                          <UploadIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="font-medium">{audioFileRef.current.files[0].name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(audioFileRef.current.files[0].size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (audioFileRef.current) audioFileRef.current.value = '';
                            }}
                            className="text-red-500 hover:text-red-700 mt-2 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Headphones className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">MP3, WAV, M4A, FLAC (Max 50MB)</p>
                        </div>
                      )}
                      <input
                        ref={audioFileRef}
                        type="file"
                        accept="audio/*"
                        disabled={isUploading}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => audioFileRef.current?.click()}
                        disabled={isUploading}
                        className="mt-2"
                      >
                        Browse Files
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUploading} 
                    className="w-full"
                  >
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Story (Goes Live Immediately)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admin Email</p>
                      <p className="font-semibold text-lg">{adminUser?.email}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Statistics</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Stories</p>
                        <p className="text-2xl font-bold">{stories.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Stories</p>
                        <p className="text-2xl font-bold text-yellow-600">{pendingStories.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Story Detail Modal */}
      <Dialog open={!!selectedStory} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedStory.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Thumbnail */}
                {selectedStory.thumbnailPath && (
                  <div className="relative w-full h-64">
                    <Image
                      src={`/uploads/${selectedStory.thumbnailPath}`}
                      alt={selectedStory.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Creator Info */}
                <div className="space-y-2 p-4 bg-accent/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Creator Email</p>
                  <p className="font-semibold text-lg">{selectedStory.userEmail}</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Description</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedStory.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-accent/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-semibold text-sm">
                      {new Date(selectedStory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="font-semibold text-sm">👁️ {selectedStory.views}</p>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Likes</p>
                    <p className="font-semibold text-sm">❤️ {selectedStory.likes}</p>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedStory.status)}
                    </div>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Play Audio</Label>
                  <div className="bg-accent/5 p-4 rounded-lg">
                    <AudioPlayer audioUrl={`/uploads/${selectedStory.audioPath}`} />
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedStory.status === 'pending' && (
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedStory(null)}
                      disabled={isApproving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectStory(selectedStory.id)}
                      disabled={isApproving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveStory(selectedStory.id)}
                      disabled={isApproving}
                    >
                      {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </DialogFooter>
                )}

                {selectedStory.status !== 'pending' && (
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                    <span className="text-sm font-medium">
                      Status: {selectedStory.status.charAt(0).toUpperCase() + selectedStory.status.slice(1)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedStory(null)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
