import axiosInstance from './axios';

export interface BestTimeReport {
  dayName: string;
  hour: number;
  recommendation: string;
}

export const getBestTimeApi = async (): Promise<BestTimeReport> => {
  const response = await axiosInstance.get<BestTimeReport>('/insights/best-time');
  return response.data;
};
