import axiosInstance from './axios';

export interface GeneratedPost {
  caption: string;
  hashtags: string[];
  imageUrl: string | null;
  videoUrl: string | null;
  imageSuggestion: string;
}

export interface PostGenerationRequest {
  command: string;
  count: number;
  modelId?: string;
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

export const generateContentStrategyApi = async (): Promise<ContentGapResponse> => {
  const response = await axiosInstance.get<ContentGapResponse>('/ai/content-strategy');
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

export interface MemeRequest {
  modelId?: string;
  command?: string;
}

export interface MemeResponse {
  imageUrl: string;
  caption: string;
}

export const generateMemeApi = async (data: MemeRequest): Promise<MemeResponse> => {
  const response = await axiosInstance.post<MemeResponse>('/ai/meme', data);
  return response.data;
};

export interface ViralOpportunityRequest {
  nicheTopic: string;
}

export interface ViralOpportunityResponse {
  trend: string;
  viralGap: string;
  draftPost: string;
  hashtags: string[];
}

export const generateViralOpportunityApi = async (data: ViralOpportunityRequest): Promise<ViralOpportunityResponse> => {
  const response = await axiosInstance.post<ViralOpportunityResponse>('/ai/viral-opportunity', data);
  return response.data;
};

export const generateThreadApi = async (data: PostGenerationRequest): Promise<string[]> => {
  const response = await axiosInstance.post<string[]>('/ai/generate-thread', data);
  return response.data;
};

export interface CarouselGenerationRequest {
  command?: string;
  slideCount?: number;
  modelId?: string;
}

export interface CarouselSlide {
  slideNumber: number;
  slideText: string;
  imageSuggestion: string;
  imageUrl: string;
}

export interface CarouselResponse {
  caption: string;
  slides: CarouselSlide[];
}

export const generateCarouselApi = async (data: CarouselGenerationRequest): Promise<CarouselResponse> => {
  const response = await axiosInstance.post<CarouselResponse>('/ai/carousel', data);
  return response.data;
};

export interface RepurposeRequest {
  url: string;
  modelId?: string;
}

export const repurposeUrlApi = async (data: RepurposeRequest): Promise<GenerationResponse> => {
  const response = await axiosInstance.post<GenerationResponse>('/ai/repurpose', data);
  return response.data;
};
