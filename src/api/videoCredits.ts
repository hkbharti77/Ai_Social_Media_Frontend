import axiosInstance from './axios';

// ── Types ────────────────────────────────────────────────────────────────────

export interface VideoCreditPack {
  packName: string;
  modelId: string;
  videoCount: number;
  priceInr: number;
  displayName: string;
  packType: 'Manual' | 'Pack';
  pricePerVideo: string;
}

export interface VideoCreditPacksGrouped {
  lite: VideoCreditPack[];
  fast: VideoCreditPack[];
  standard: VideoCreditPack[];
}

export interface VideoCreditWallet {
  lite: number;
  fast: number;
  standard: number;
  warnings: string[];
}

export interface VideoModel {
  modelId: string;
  qualityTier: string;
  description: string;
  requiredLevel: number;
  requiredTier: string;
  accessible: boolean;
  extraVideoPrice: number | null;
  extraVideoPriceInr: string;
}

export interface VideoModelsResponse {
  models: VideoModel[];
  userTier: string;
  canGenerateVideo: boolean;
  monthlyVideoLimit: number;
  videosRemaining: number;
  videosUsed: number;
}

export interface CreateVideoCreditOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  packName: string;
  modelId: string;
  credits: number;
}

// ── API calls ────────────────────────────────────────────────────────────────

export const getVideoModelsApi = async (): Promise<VideoModelsResponse> => {
  const response = await axiosInstance.get<VideoModelsResponse>('/ai/video-models');
  return response.data;
};

export const getVideoCreditPacksApi = async (): Promise<VideoCreditPacksGrouped> => {
  const response = await axiosInstance.get<VideoCreditPacksGrouped>('/video-credits/packs');
  return response.data;
};

export const getVideoCreditPacksByModelApi = async (modelId: string): Promise<VideoCreditPack[]> => {
  const response = await axiosInstance.get<VideoCreditPack[]>(`/video-credits/packs/${modelId}`);
  return response.data;
};

export const getVideoCreditWalletApi = async (): Promise<VideoCreditWallet> => {
  const response = await axiosInstance.get<VideoCreditWallet>('/video-credits/wallet');
  return response.data;
};

export const createVideoCreditOrderApi = async (packName: string): Promise<CreateVideoCreditOrderResponse> => {
  const response = await axiosInstance.post<CreateVideoCreditOrderResponse>('/video-credits/create-order', { packName });
  return response.data;
};

export const verifyVideoCreditPaymentApi = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  const response = await axiosInstance.post('/video-credits/verify-payment', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return response.data;
};

export interface CreateCustomOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  modelId: string;
  credits: number;
  priceInr: number;
}

export const createCustomVideoCreditOrderApi = async (
  modelId: string,
  quantity: number
): Promise<CreateCustomOrderResponse> => {
  const response = await axiosInstance.post<CreateCustomOrderResponse>('/video-credits/create-custom-order', {
    modelId,
    quantity,
  });
  return response.data;
};
