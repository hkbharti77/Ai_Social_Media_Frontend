import axios from './axios';

export interface AiJob {
  id: number;
  correlationId: string;
  taskType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const getActiveJobs = async (): Promise<AiJob[]> => {
  const { data } = await axios.get('/ai/jobs/active');
  return data;
};
