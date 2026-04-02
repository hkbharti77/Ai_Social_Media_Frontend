import axiosInstance from './axios';

export const PostStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
} as const;

export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export interface DashboardStats {
  draftCount: number;
  scheduledCount: number;
  publishedCount: number;
  failedCount: number;
}

export interface Post {
  id?: number;
  caption: string;
  hashtags: string;
  imageUrl: string;
  platform: string;
  status: PostStatus;
  slotType?: 'MORNING' | 'EVENING';
  autoScheduled?: boolean;
  scheduledAt?: string;
  publishedAt?: string;
  failureReason?: string;
  isThread?: boolean;
  threadContent?: string;
  isCarousel?: boolean;
  carouselContent?: string;
  // Evergreen Queue fields
  isEvergreen?: boolean;
  evergreenScore?: number;
  lastRecycledAt?: string;
}

export const getPostsApi = async (): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>('/posts');
  return response.data;
};

export const getPostStatsApi = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get<DashboardStats>('/posts/stats');
  return response.data;
};

export const createPostApi = async (post: Post): Promise<Post> => {
  const response = await axiosInstance.post<Post>('/posts', post);
  return response.data;
};

export const updatePostApi = async (id: number, post: Partial<Post>): Promise<Post> => {
  const response = await axiosInstance.put<Post>(`/posts/${id}`, post);
  return response.data;
};

export const deletePostApi = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/posts/${id}`);
};

export const schedulePostApi = async (id: number, scheduledAt: string): Promise<Post> => {
  const response = await axiosInstance.post<Post>(`/posts/${id}/schedule`, null, {
    params: { scheduledAt }
  });
  return response.data;
};

export const getDraftsApi = async (): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>('/posts/drafts');
  return response.data;
};

export const approveDraftApi = async (id: number): Promise<Post> => {
  const response = await axiosInstance.put<Post>(`/posts/${id}/approve`);
  return response.data;
};

export const generateDraftApi = async (slot: 'MORNING' | 'EVENING'): Promise<Post> => {
  const response = await axiosInstance.post<Post>('/posts/generate-draft', null, {
    params: { slot }
  });
  return response.data;
};

// ─── Evergreen Queue API ───────────────────────────────────────────

export const getEvergreenPostsApi = async (): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>('/posts/evergreen');
  return response.data;
};

export const markEvergreenApi = async (id: number): Promise<Post> => {
  const response = await axiosInstance.put<Post>(`/posts/${id}/evergreen`);
  return response.data;
};

export const unmarkEvergreenApi = async (id: number): Promise<Post> => {
  const response = await axiosInstance.delete<Post>(`/posts/${id}/evergreen`);
  return response.data;
};

export interface EvergreenFillResult {
  message: string;
  scheduledPostId?: number;
  scheduledAt?: string;
}

export const triggerEvergreenFillApi = async (slot: 'MORNING' | 'EVENING' = 'MORNING'): Promise<EvergreenFillResult> => {
  const response = await axiosInstance.post<EvergreenFillResult>('/posts/evergreen/fill', null, {
    params: { slot }
  });
  return response.data;
};
