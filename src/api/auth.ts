import axiosInstance from './axios';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  roles?: string[];
  referralCode?: string;
  deviceFingerprint?: string;
}

export interface MessageResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const registerApi = async (data: SignupRequest): Promise<MessageResponse> => {
  const response = await axiosInstance.post<MessageResponse>('/auth/register', data);
  return response.data;
};

export const logoutApi = async (): Promise<MessageResponse> => {
  const response = await axiosInstance.post<MessageResponse>('/auth/logout');
  return response.data;
};

export const forgotPasswordApi = async (email: string): Promise<MessageResponse> => {
  const response = await axiosInstance.post<MessageResponse>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (token: string, newPassword: string): Promise<MessageResponse> => {
  const response = await axiosInstance.post<MessageResponse>('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const validateResetTokenApi = async (token: string): Promise<MessageResponse> => {
  const response = await axiosInstance.get<MessageResponse>(`/auth/reset-password/validate?token=${token}`);
  return response.data;
};

export interface LoginHistoryEntry {
  id: number;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  status: 'SUCCESS' | 'FAILED';
  isNewIp: boolean;
  createdAt: string;
}

export const getLoginHistoryApi = async (): Promise<LoginHistoryEntry[]> => {
  const response = await axiosInstance.get<LoginHistoryEntry[]>('/auth/login-history');
  return response.data;
};
