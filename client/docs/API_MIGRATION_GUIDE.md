# FeoSync API Migration Guide

This guide explains how to migrate any feature page from mock data to the real API integration using React Query.

## Overview

The application supports both **mock API** (for development/testing) and **real API** (for production). You can toggle between them using environment variables.

### Configuration

**Use Mock API (Development):**
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_API=true
```

**Use Real API (Production):**
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-api.com/api
NEXT_PUBLIC_USE_MOCK_API=false
```

## Migration Steps

### 1. Import React Query Hooks

Replace old mock services with new React Query hooks:

```typescript
// OLD
import { orgService } from '@/lib/services';

// NEW
import { useOrganizations, useCreateOrganization, useDeleteOrganization } from '@/lib/api/hooks';
```

### 2. Replace Mock Calls with React Query

**Before (Mock):**
```typescript
const [orgs, setOrgs] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  orgService.getOrganizations()
    .then(setOrgs)
    .finally(() => setLoading(false));
}, []);
```

**After (React Query):**
```typescript
const { data: orgs = [], isLoading } = useOrganizations();
```

### 3. Handle Mutations

**Before (Mock):**
```typescript
const handleCreate = async (data) => {
  try {
    await orgService.createOrganization(data);
    setOrgs([...orgs, newOrg]);
    toast.success('Created');
  } catch (err) {
    toast.error('Failed');
  }
};
```

**After (React Query):**
```typescript
const createMutation = useCreateOrganization({
  onSuccess: () => {
    toast({ title: 'Created' });
  },
  onError: (err) => {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
  },
});

const handleCreate = async (data) => {
  await createMutation.mutateAsync(data);
};
```

## Examples by Feature

### Organizations

**File: `app/dashboard/organizations/page-api.tsx`**

Key changes:
- Uses `useOrganizations()`, `useCreateOrganization()`, `useDeleteOrganization()`
- Automatic cache invalidation on mutations
- Built-in loading/error states
- Toast notifications for user feedback

### Facebook Pages

Update `app/dashboard/pages/page.tsx`:

```typescript
const { data: pages = [], isLoading } = useFacebookPages(orgId);
const connectMutation = useConnectFacebookPage(orgId);
const toggleMutation = useTogglePageActive(orgId);

// Handle connect
const handleConnect = async (data) => {
  await connectMutation.mutateAsync(data);
};

// Handle toggle
const handleToggle = async (pageId, isActive) => {
  await toggleMutation.mutateAsync({ pageId, isActive });
};
```

### Templates

Update `app/dashboard/templates/page.tsx`:

```typescript
const { data: templates = [], isLoading } = useTemplates(orgId);
const createMutation = useCreateTemplate(orgId);
const updateMutation = useUpdateTemplate(orgId, templateId);
const deleteMutation = useDeleteTemplate(orgId);
```

### Scheduled Posts

Update `app/dashboard/scheduled-posts/page.tsx`:

```typescript
const { data: posts = [], isLoading } = useScheduledPosts(orgId);
const createMutation = useCreateScheduledPost(orgId);
const publishMutation = usePublishPost(orgId);
const deleteMutation = useDeleteScheduledPost(orgId);

const handlePublish = async (postId) => {
  await publishMutation.mutateAsync(postId);
};
```

### Analytics & Dashboard

Update `app/dashboard/page.tsx`:

```typescript
const { data: analytics, isLoading } = useAnalytics(orgId);
const { data: notifications } = useNotifications();

// Display analytics data
if (isLoading) return <Skeleton />;
return (
  <div>
    <DashboardCards 
      totalPosts={analytics.totalPosts}
      scheduled={analytics.totalScheduled}
      engagementRate={analytics.avgEngagement}
    />
  </div>
);
```

## Handling Errors

All React Query hooks pass errors through the `onError` callback:

```typescript
const mutation = useCreateOrganization({
  onError: (error: ApiError) => {
    console.error('API Error:', error.message);
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  },
});
```

## Loading States

React Query provides `isLoading`, `isPending`, and `isFetching` states:

```typescript
const { isLoading, isPending, isFetching } = useOrganizations();

// Show skeleton while loading
{isLoading && <Skeleton />}

// Show spinner on button while saving
<Button disabled={isPending}>
  {isPending ? 'Saving...' : 'Save'}
</Button>
```

## Cache Management

React Query automatically handles caching:

- **5-minute cache** for queries (queries remain in cache for 5 min)
- **10-minute GC time** (garbage collection after 10 min of not being used)
- **Automatic invalidation** on mutations
- **Optimistic updates** supported (see React Query docs)

### Manual cache operations:

```typescript
const queryClient = useQueryClient();

// Invalidate all queries
queryClient.invalidateQueries();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['organizations'] });

// Set query data manually
queryClient.setQueryData(['organizations', id], newData);
```

## Toggling Mock vs Real API

At runtime, toggle between mock and real API (for testing):

```typescript
// In browser console
localStorage.setItem('USE_MOCK_API', 'true');  // Use mock
localStorage.setItem('USE_MOCK_API', 'false'); // Use real
location.reload();
```

## Mock API Data

The mock API provides realistic test data:

- **Organizations**: 2 mock organizations
- **Facebook Pages**: 2-3 pages per org
- **Templates**: 5+ templates with categories
- **Schedules**: 2 example schedules (daily + weekly)
- **Scheduled Posts**: 2 sample posts
- **Published Posts**: 2 sample posts with engagement metrics
- **Notifications**: 10+ notifications (read/unread)
- **Analytics**: Computed from published posts

Simulated API delay: **300-500ms** for realistic testing

## Form Validation

Use Zod schemas for validation:

```typescript
import { createOrgSchema, type CreateOrgFormData } from '@/lib/api/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const { control, handleSubmit } = useForm<CreateOrgFormData>({
  resolver: zodResolver(createOrgSchema),
});
```

## Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_USE_MOCK_API=true
```

## Type Safety

All API operations are fully typed:

```typescript
import type { Organization, CreateOrgRequest } from '@/lib/api/types';

// IntelliSense suggests all properties
const org: Organization = {
  id: 'org-1',
  name: 'My Org',
  description: 'Description',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Testing

Test with mock API without backend:

```typescript
// Mock API is enabled by default
const { data } = useOrganizations(); // Uses mock data with 300ms delay

// Set NEXT_PUBLIC_API_URL to test with real backend
```

## Migration Checklist

- [ ] Replace service imports with React Query hooks
- [ ] Replace `useEffect` with hook calls
- [ ] Update loading states (use `isLoading` from hooks)
- [ ] Update error handling (use `onError` callback)
- [ ] Add toast notifications
- [ ] Test with mock API first
- [ ] Test with real API when ready
- [ ] Verify cache invalidation on mutations
- [ ] Update TypeScript types if needed

## Common Patterns

### Dependent Queries

```typescript
const { data: org } = useOrganization(orgId, { enabled: !!orgId });
const { data: pages } = useFacebookPages(org?.id || '', { enabled: !!org?.id });
```

### Parallel Queries

```typescript
const orgsQuery = useOrganizations();
const notificationsQuery = useNotifications();

if (orgsQuery.isLoading || notificationsQuery.isLoading) return <Skeleton />;
```

### Refetch on Interval

```typescript
const { data } = useAnalytics(orgId, {
  refetchInterval: 30000, // Refetch every 30 seconds
});
```

## Next Steps

1. Start with organizations page (`page-api.tsx` example provided)
2. Migrate Facebook pages feature
3. Migrate templates and schedules
4. Migrate scheduled/published posts
5. Migrate analytics dashboard
6. Deploy with real API URL
