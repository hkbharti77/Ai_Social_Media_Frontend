import axiosInstance from './axios';

export interface MediaUploadResponse {
  url: string;
  downloadUrl?: string;
  fileName: string;
  contentType: string;
  size: number;
}

/** Upload a real file (multipart/form-data) → returns the S3 public URL */
export const uploadMediaApi = async (file: File): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<MediaUploadResponse>('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/** List all media objects stored in S3 */
export const listMediaApi = async (): Promise<{url: string, downloadUrl: string}[]> => {
  const response = await axiosInstance.get<{url: string, downloadUrl: string}[]>('/media/all');
  return response.data;
};

/** Delete a media file by its URL or key */
export const deleteMediaApi = async (url: string): Promise<{message: string; url: string}> => {
  const response = await axiosInstance.delete<{message: string; url: string}>('/media/delete', {
    params: { url },
  });
  return response.data;
};
