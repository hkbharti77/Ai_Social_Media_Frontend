import axios from './axios';

export interface ProfileData {
  id?: number;
  businessName: string;
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
  
  user?: any;
}

export const getProfile = async (): Promise<ProfileData> => {
  const response = await axios.get<ProfileData>('/profile');
  return response.data;
};

export const updateProfile = async (data: ProfileData): Promise<ProfileData> => {
  const response = await axios.put<ProfileData>('/profile', data);
  return response.data;
};
