import axiosInstance from './axios';

export interface SocialAccount {
  id: number;
  platform: string;
  pageId?: string;
  igBusinessAccountId?: string;
  accountName?: string;
  profilePictureUrl?: string;
  handle?: string;
  connectedAt: string;
}

export const getFacebookConnectUrl = async (): Promise<string> => {
  const response = await axiosInstance.get<string>('/social/connect/facebook');
  return response.data;
};

export const getLinkedInConnectUrl = async (): Promise<string> => {
  const response = await axiosInstance.get<string>('/social/connect/linkedin');
  return response.data;
};

export const getXConnectUrl = async (state: string): Promise<string> => {
  const response = await axiosInstance.get<string>(`/social/connect/x?state=${state}`);
  return response.data;
};

export const getSocialAccounts = async (): Promise<SocialAccount[]> => {
  const response = await axiosInstance.get<SocialAccount[]>('/social/accounts');
  return Array.isArray(response.data) ? response.data : [];
};

export const disconnectSocialAccount = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/social/accounts/${id}`);
};
