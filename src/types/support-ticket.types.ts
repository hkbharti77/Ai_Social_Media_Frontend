export const SupportTicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type SupportTicketStatus = typeof SupportTicketStatus[keyof typeof SupportTicketStatus];

export const SupportTicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL',
} as const;

export type SupportTicketPriority = typeof SupportTicketPriority[keyof typeof SupportTicketPriority];

export interface SupportTicketRequest {
  subject: string;
  description: string;
  priority: SupportTicketPriority;
}

export interface SupportTicketResponse {
  id: number;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  userId: number;
  userFullName: string | null;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}
