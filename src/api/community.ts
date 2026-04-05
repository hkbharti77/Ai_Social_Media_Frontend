import axios from './axios';

export interface Comment {
  id: number;
  externalCommentId: string;
  text: string;
  authorName: string;
  authorProfilePictureUrl: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'X';
  createdAt: string;
  isReplied: boolean;
  aiDraftReply?: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'QUESTION' | 'SPAM';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  post?: {
    id: number;
    caption: string;
  };
}

export const getInboxApi = async (sentiment?: string, priority?: string): Promise<Comment[]> => {
  const params = new URLSearchParams();
  if (sentiment) params.append('sentiment', sentiment);
  if (priority) params.append('priority', priority);
  const response = await axios.get(`/community/inbox?${params.toString()}`);
  return response.data;
};

export const syncCommentsApi = async (): Promise<Comment[]> => {
  const response = await axios.post('/community/sync');
  return response.data;
};

export const draftReplyApi = async (commentId: number): Promise<{ draft: string }> => {
  const response = await axios.post(`/community/${commentId}/draft`);
  return response.data;
};

export const sendReplyApi = async (commentId: number, replyText: string): Promise<void> => {
  await axios.post(`/community/${commentId}/reply`, { replyText });
};
