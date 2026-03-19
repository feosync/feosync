'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { scheduledPostService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';
import type { ScheduledPost } from '@/lib/mockData';

export default function ScheduledPostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await scheduledPostService.getScheduledPostsByOrganization(user?.id || '');
      setPosts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const updated = await scheduledPostService.publishScheduledPost(id);
      if (updated) {
        setPosts(posts.map((p) => (p.id === id ? updated : p)));
        toast({
          title: 'Success',
          description: 'Post published successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish post',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scheduled post?')) return;
    try {
      await scheduledPostService.deleteScheduledPost(id);
      setPosts(posts.filter((p) => p.id !== id));
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Scheduled Posts
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your scheduled and ready-to-publish posts
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No scheduled posts yet. Create one to schedule your content!
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Scheduled Post
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-medium">
                      {post.caption}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Scheduled for {formatDateTime(post.scheduledFor)}
                    </p>
                  </div>
                  <Badge
                    className={STATUS_COLORS[post.status as keyof typeof STATUS_COLORS]}
                  >
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Badge>
                </div>

                <div className="flex gap-2 justify-end">
                  {post.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(post.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publish Now
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
