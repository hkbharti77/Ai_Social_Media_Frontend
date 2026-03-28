import axiosInstance from './axios';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password?: string;
  roles?: string[];
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
