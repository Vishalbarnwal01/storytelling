'use client';

import AudioPlayer from '@/components/audio/AudioPlayer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Check,
  Edit,
  FileText,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Play,
  Shield,
  Trash2,
  Upload as UploadIcon,
  User,
  Users,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  rejectionReason?: string;
}

interface AdminUser {
  id: number;
  email: string;
}

const categories = [
  { id: 'true-crime', name: 'True Crime' },
  { id: 'mystery-thriller', name: 'Mystery & Thriller' },
  { id: 'science-fiction', name: 'Science Fiction' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'romance', name: 'Romance' },
  { id: 'horror-paranormal', name: 'Horror & Paranormal' },
  { id: 'historical-fiction', name: 'Historical Fiction' },
  { id: 'biography', name: 'Biography' },
  { id: 'action-adventure', name: 'Action & Adventure' },
  { id: 'comedy-satire', name: 'Comedy & Satire' },
  { id: 'suspenseful', name: 'Suspenseful' },
  { id: 'inspirational', name: 'Inspirational' },
  { id: 'mythology', name: 'Mythology' },
];


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
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', thumbnail: null as File | null });
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<number | null>(null);
  const [isDeletingStory, setIsDeletingStory] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isDeleteStoryDialogOpen, setIsDeleteStoryDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingStoryId, setRejectingStoryId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
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

  // Open rejection modal instead of rejecting directly
  const handleRejectStory = (storyId: number) => {
    setRejectingStoryId(storyId);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  // Called when admin submits the rejection reason
  const handleRejectWithReason = async () => {
    if (!rejectionReason.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a rejection reason' });
      return;
    }
    if (!rejectingStoryId) return;

    setIsRejecting(true);
    try {
      const response = await fetch('/api/admin/stories/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: rejectingStoryId,
          adminId: adminUser?.id,
          reason: rejectionReason.trim(),
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Story rejected with reason saved' });
        setStories(stories.map(s => s.id === rejectingStoryId ? { ...s, status: 'rejected', rejectionReason: rejectionReason.trim() } : s));
        setIsRejectModalOpen(false);
        setSelectedStory(null);
      } else {
        const data = await response.json();
        toast({ variant: 'destructive', title: 'Error', description: data.error || 'Failed to reject story' });
      }
    } catch (error) {
      console.error('Error rejecting story:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject story' });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setEditFormData({ title: story.title, description: story.description, thumbnail: null });
    setIsEditingStory(true);
  };

  const handleEditStorySubmit = async () => {
    if (!editingStory || !editFormData.title.trim() || !editFormData.description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', editFormData.title);
      formData.append('description', editFormData.description);

      if (editFormData.thumbnail) {
        formData.append('thumbnail', editFormData.thumbnail);
      }

      const response = await fetch(`/api/admin/stories/${editingStory.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Story updated successfully',
        });
        setIsEditingStory(false);
        await fetchStories();
        setSelectedStory(null);
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleDeleteStory = (storyId: number) => {
    setDeletingStoryId(storyId);
    setIsDeleteStoryDialogOpen(true);
  };

  const handleDeleteStoryConfirm = async () => {
    if (!deletingStoryId) return;

    setIsDeletingStory(true);
    try {
      const response = await fetch(`/api/admin/stories/${deletingStoryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Story deleted successfully',
        });
        setIsDeleteStoryDialogOpen(false);
        await fetchStories();
        setSelectedStory(null);
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsDeletingStory(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    setDeletingUserId(userId);
    setIsDeleteUserDialogOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUserId) return;

    setIsDeletingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${deletingUserId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User and all their stories deleted successfully',
        });
        setIsDeleteUserDialogOpen(false);
        await Promise.all([fetchUsers(), fetchStories()]);
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsDeletingUser(false);
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

    if (!uploadCategory.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a category',
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
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription);
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
          description: 'Story uploaded and is live now!',
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
        console.log(response, 'response');
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem("adminSession");
              window.location.href = "/";
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Logout
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                          <p className="text-sm text-muted-foreground">{story.category ? story.category : "N/A"}</p>
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
                          <span className="text-xs text-muted-foreground">
                            {story.status === 'rejected' && story.rejectionReason && (
                              <span className="text-xs text-red-500 ml-2">
                                Rejected: {story.rejectionReason}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStory(story);
                              setIsPlayingAudio(true);
                            }}
                            title="Play"
                          >
                            <Play className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStory(story);
                            }}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStory(story.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
                  {/**Select Category */}
                  <div className='space-y-2'>
                    <Label htmlFor="admin-category">Select Category</Label>
                    <Select
                      value={uploadCategory}
                      onValueChange={(value) => setUploadCategory(value)}
                      disabled={isUploading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                {/* Category song */}
                <div className="space-y-2 p-4 bg-accent/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold text-lg">{selectedStory.category ? selectedStory.category : "N/A"}</p>
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

      {/* Edit Story Modal */}
      <Dialog open={isEditingStory} onOpenChange={setIsEditingStory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                placeholder="Enter story title"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                placeholder="Enter story description"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-thumbnail" className="text-sm font-medium">
                Thumbnail (Optional)
              </label>
              <Input
                id="edit-thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    thumbnail: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingStory(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStorySubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Story Confirmation Dialog */}
      <AlertDialog open={isDeleteStoryDialogOpen} onOpenChange={setIsDeleteStoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingStory}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStoryConfirm}
              disabled={isDeletingStory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingStory ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user and all their stories? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingUser}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUserConfirm}
              disabled={isDeletingUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingUser ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Rejection Reason Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={(open) => { if (!isRejecting) setIsRejectModalOpen(open); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <X className="h-5 w-5" />
              Reject Story
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection. This will be recorded in the system.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
              disabled={isRejecting}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectWithReason}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
