import axiosInstance from './axios';

export interface GeneratedPost {
  caption: string;
  hashtags: string[];
  imageUrl: string | null;
  imageSuggestion: string;
}

export interface PostGenerationRequest {
  command: string;
  count: number;
}

export interface GenerationResponse {
  posts: GeneratedPost[];
}

export const generatePostsApi = async (data: PostGenerationRequest): Promise<GenerationResponse> => {
  const response = await axiosInstance.post<GenerationResponse>('/ai/generate', data);
  return response.data;
};
