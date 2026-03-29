import axiosInstance from './axios';

export interface MicrositeLink {
  id?: number;
  title: string;
  url: string;
  icon: string;
  orderIndex: number;
  clickCount: number;
}

export const getMicrositeLinksApi = async (brandSlug: string): Promise<MicrositeLink[]> => {
  const response = await axiosInstance.get<MicrositeLink[]>(`/microsite/${brandSlug}`);
  return response.data;
};

export const createMicrositeLinkApi = async (link: Omit<MicrositeLink, 'id' | 'clickCount'>): Promise<MicrositeLink> => {
  const response = await axiosInstance.post<MicrositeLink>('/microsite/links', link);
  return response.data;
};

export const updateMicrositeLinkApi = async (id: number, link: Partial<MicrositeLink>): Promise<MicrositeLink> => {
  const response = await axiosInstance.put<MicrositeLink>(`/microsite/links/${id}`, link);
  return response.data;
};

export const deleteMicrositeLinkApi = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/microsite/links/${id}`);
};
