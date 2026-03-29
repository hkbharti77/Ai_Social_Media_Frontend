import axiosInstance from './axios';

export interface ReviewData {
  id: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  createdTime: string;
}

export interface ReviewReplyRequest {
  reviewId: string;
  replyText: string;
}

export const getReviewsApi = async (): Promise<ReviewData[]> => {
  const response = await axiosInstance.get<ReviewData[]>('/fb-reviews');
  return response.data;
};

export const generateReviewReplyApi = async (review: ReviewData): Promise<string> => {
  const response = await axiosInstance.post<string>('/fb-reviews/generate-reply', review);
  return response.data;
};

export const postReviewReplyApi = async (data: ReviewReplyRequest): Promise<void> => {
  await axiosInstance.post('/fb-reviews/reply', data);
};
