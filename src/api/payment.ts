import axios from './axios';

interface CreateOrderResponse {
    order_id?: string;
    amount?: number;
    currency?: string;
    key_id?: string;
    is_free?: boolean;
    status?: string;
    message?: string;
}

export const createRazorpayOrder = async (tier: string): Promise<CreateOrderResponse> => {
    const response = await axios.post<CreateOrderResponse>('/payments/create-order', { tier });
    return response.data;
};

export const verifyRazorpayPayment = async (
    razorpay_order_id: string, 
    razorpay_payment_id: string, 
    razorpay_signature: string
) => {
    const response = await axios.post('/payments/verify-payment', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    });
    return response.data;
};

export interface UpgradePreviewResponse {
    targetTier: string;
    originalPrice: number;
    proRatedPrice: number;
    discountApplied: number;
    currency: string;
}

export const getUpgradePreview = async (tier: string): Promise<UpgradePreviewResponse> => {
    const response = await axios.get<UpgradePreviewResponse>(`/payments/preview-upgrade/${tier}`);
    return response.data;
};
