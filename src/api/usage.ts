import axios from './axios';

export interface PaymentOrder {
  id: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  completedAt: string;
  targetTier: string;
}

export interface CreditUsage {
  id: number;
  amount: number;
  purpose: string;
  createdAt: string;
}

export const getPaymentHistory = async (): Promise<PaymentOrder[]> => {
  const response = await axios.get<PaymentOrder[]>('/payments/history');
  return response.data;
};

export const downloadReceiptPdf = async (orderId: string) => {
  const response = await axios.get(`/payments/receipt/${orderId}`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `receipt-${orderId}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getUsageHistory = async (): Promise<CreditUsage[]> => {
  const response = await axios.get<CreditUsage[]>('/usage/history');
  return response.data;
};
