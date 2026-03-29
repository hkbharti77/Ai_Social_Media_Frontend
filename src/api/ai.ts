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

export interface ContentGapRequest {
  businessType: string;
  city: string;
  targetAudience: string;
}

export interface GapIdea {
  topic: string;
  whyItWorks: string;
  sampleCaption: string;
}

export interface ContentGapResponse {
  ideas: GapIdea[];
}

export const generateGapAnalysisApi = async (data: ContentGapRequest): Promise<ContentGapResponse> => {
  const response = await axiosInstance.post<ContentGapResponse>('/ai/gap-analysis', data);
  return response.data;
};

export interface PerformancePredictionResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  predicted_outcome: string;
}

export const predictPerformanceApi = async (draft: string): Promise<PerformancePredictionResponse> => {
  const response = await axiosInstance.post<PerformancePredictionResponse>('/ai/predict-performance', { draft });
  return response.data;
};
