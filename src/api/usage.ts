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

export interface AiUsageLog {
  id: number;
  modelId: string;
  actionType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  createdAt: string;
}

export interface AiUsageSummary {
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const getPaymentHistory = async (): Promise<PaymentOrder[]> => {
  const response = await axios.get<PaymentOrder[]>('/payments/history');
  return response.data;
};

export const downloadReceiptPdf = async (orderId: string) => {
  const response = await axios.get(`/payments/receipt/${orderId}`, {
    responseType: 'blob',
  });

  // Verify we got a PDF back (not an error JSON)
  const contentType = response.headers['content-type'] || '';
  if (!contentType.includes('pdf')) {
    throw new Error('Receipt not available for this order');
  }

  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `receipt-${orderId}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke URL to free memory
  window.URL.revokeObjectURL(blobUrl);
};

export const getUsageHistory = async (): Promise<CreditUsage[]> => {
  const response = await axios.get<CreditUsage[]>('/usage/history');
  return response.data;
};

export const getAiUsageLogs = async (): Promise<AiUsageLog[]> => {
  const response = await axios.get<AiUsageLog[]>('/usage/ai-logs');
  return Array.isArray(response.data) ? response.data : [];
};

export const getAiUsageSummary = async (): Promise<AiUsageSummary[]> => {
  const response = await axios.get<AiUsageSummary[]>('/usage/ai-summary');
  return Array.isArray(response.data) ? response.data : [];
};
