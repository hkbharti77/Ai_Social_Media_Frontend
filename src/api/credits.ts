import axiosInstance from './axios';
import type { MessageResponse } from './auth';

export const claimAdRewardApi = async (): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>('/credits/ad-reward');
    return response.data;
};

export const startAdSessionApi = async (): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>('/credits/ad-start');
    return response.data;
};
