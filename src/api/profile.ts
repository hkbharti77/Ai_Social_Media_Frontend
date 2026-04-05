import axios from './axios';
import type { User } from '../types/auth';

export interface ProfileData {
  id?: number;
  businessName: string;
  brandSlug?: string;
  niche: string;
  targetAudience: string;
  brandTone: string;
  postingFrequency: number;
  preferredHashtags: string;
  
  // Enterprise Image Control Layers
  imageStyle?: string;
  peoplePreference?: string;
  brandColors?: string[];
  brandMood?: string;
  designStyle?: string;
  visualConstraints?: string;
  imageType?: string;
  compositionStyle?: string;
  cameraAngle?: string;
  lightingStyle?: string;
  colorTemperature?: string;
  backgroundStyle?: string;
  subjectFocus?: string;
  textOverlay?: {
    enabled: boolean;
    style: string;
    position: string;
  };
  logoPlacement?: string;
  aspectRatio?: string;
  qualityLevel?: string;
  creativityLevel?: number;
  referenceImageUrl?: string | null;
  negativePrompt?: string;
  
  // Dynamic Scheduling Fields
  morningDraftTime?: string;
  eveningDraftTime?: string;
  morningPublishTime?: string;
  eveningPublishTime?: string;
  useAiBestTime?: boolean;
  
  user?: User;

  // Brand Voice Training Layer
  brandVoiceSamples?: string[];
  brandVoiceImageUrls?: string[];
  brandStyleDna?: string;
  defaultVoiceMode?: 'DEFAULT' | 'STYLE_DNA' | 'FULL_CONTEXT';
}

export const generateStyleDna = async (): Promise<{ dna: string }> => {
  const response = await axios.post<{ dna: string }>('/profile/generate-dna');
  return response.data;
};

export interface ProfileResponse {
  profile: ProfileData;
  subscription: {
    tier: string;
    tierOrdinal: number;
    monthlyCredits: number;
    dailyCreditsUsed: number;
    purchasedModelIds: string[];
    maxProfiles: number;
    lastGenerationAt: string;
    expiresAt?: string;
    storedImagesCount: number;
    maxStoredImages: number;
    referralCode?: string;
    bonusCredits: number;
    dailyAdsViewed: number;
  };
}

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await axios.get<ProfileResponse>('/profile');
  return response.data;
};

export const listProfilesApi = async (): Promise<ProfileData[]> => {
  const response = await axios.get<ProfileData[]>('/profile/all');
  return response.data;
};

export const updateProfile = async (data: ProfileData): Promise<ProfileData> => {
  const response = await axios.put<ProfileData>('/profile', data);
  return response.data;
};

export interface SuggestedTimes {
  morningDraftTime: string;
  eveningDraftTime: string;
  morningPublishTime: string;
  eveningPublishTime: string;
  reason: string;
}

export const getSuggestedTimes = async (): Promise<SuggestedTimes> => {
  const response = await axios.get<SuggestedTimes>('/profile/suggest-best-time');
  return response.data;
};
