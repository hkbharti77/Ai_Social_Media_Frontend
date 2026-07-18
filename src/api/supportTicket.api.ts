import axiosInstance from './axios';
import type { SupportTicketRequest, SupportTicketResponse } from '../types/support-ticket.types';
import { SupportTicketStatus } from '../types/support-ticket.types';

export const createTicketApi = async (data: SupportTicketRequest): Promise<SupportTicketResponse> => {
  const response = await axiosInstance.post<SupportTicketResponse>('/tickets', data);
  return response.data;
};

export const getMyTicketsApi = async (): Promise<SupportTicketResponse[]> => {
  const response = await axiosInstance.get<SupportTicketResponse[]>('/tickets/my-tickets');
  return response.data;
};

export const getAllTicketsApi = async (): Promise<SupportTicketResponse[]> => {
  const response = await axiosInstance.get<SupportTicketResponse[]>('/tickets');
  return response.data;
};

export const updateTicketStatusApi = async (id: number, status: SupportTicketStatus): Promise<SupportTicketResponse> => {
  const response = await axiosInstance.put<SupportTicketResponse>(`/tickets/${id}/status`, null, {
    params: { status }
  });
  return response.data;
};

export const replyToTicketApi = async (id: number, message: string): Promise<void> => {
  await axiosInstance.post(`/tickets/${id}/reply`, { message });
};
