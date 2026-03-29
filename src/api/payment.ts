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

export const createRazorpayOrder = async (tier: string, amount: number): Promise<CreateOrderResponse> => {
    const response = await axios.post<CreateOrderResponse>('/payments/create-order', { tier, amount });
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
