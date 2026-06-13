export type PublishMode = 'scheduled' | 'immediate'

export interface Post {
  id: string
  content: string
  mediaUrls: string[]
  status: 'draft' | 'scheduled' | 'published'
  scheduledAt?: string
  publishedAt?: string
  publishMode: PublishMode
  account: {
    username: string
    avatarUrl?: string
  }
}
