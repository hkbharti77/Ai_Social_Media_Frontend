import axios from './axios';

export interface PricingTier {
  id: number;
  name: string;
  priceInr: string;
  priceAmount: number;
  description: string;
  monthlyCredits: number;
  dailyLimit: number;
  features: string[];
  popular: boolean;
}

export const getPricingTiersApi = async (): Promise<PricingTier[]> => {
  const response = await axios.get<PricingTier[]>('/pricing');
  return response.data;
};
