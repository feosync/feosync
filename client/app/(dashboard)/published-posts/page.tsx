'use client';

import { useState, useEffect } from 'react';
import { Trash2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { publishedPostService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/utils';
import type { PublishedPost } from '@/lib/mockData';

export default function PublishedPostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await publishedPostService.getPublishedPostsByOrganization(user?.id || '');
      setPosts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await publishedPostService.deletePublishedPost(id);
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
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Published Posts
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View your published posts and their engagement metrics
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            No published posts yet. Create and publish your first post!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-slate-900 dark:text-white mb-2">
                    {post.content}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Published {formatDateTime(post.publishedAt)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {post.likes}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Likes</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {post.comments}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">Comments</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {post.shares}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Shares</p>
                  </div>
                </div>

                <div className="flex justify-end">
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
