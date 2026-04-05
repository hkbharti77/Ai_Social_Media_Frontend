import axios from "./axios";

export interface AdminStats {
    totalUsers: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
    totalTokensUsed: number;
    totalCreditsSpent: number;
}

export interface ModelUsageStats {
    modelId: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    callCount: number;
}

export interface UserIntelligence {
    userId: number;
    email: string;
    fullName: string;
    totalTokens: number;
    loginCount: number;
    lastLoginAt: string;
    topModelId: string;
    modelBreakdown: Record<string, number>;
}

export interface DetailedAiLog {
    id: number;
    user: {
        email: string;
        fullName: string;
    } | null;
    modelId: string;
    actionType: string;
    promptText: string;
    resultUrl: string | null;
    totalTokens: number;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
    const response = await axios.get('/admin/stats/overview');
    return response.data || {
        totalUsers: 0,
        activeUsersToday: 0,
        activeUsersThisWeek: 0,
        totalTokensUsed: 0,
        totalCreditsSpent: 0
    };
};

export const getAdminModelStats = async (): Promise<ModelUsageStats[]> => {
    const response = await axios.get('/admin/analytics/models');
    return Array.isArray(response.data) ? response.data : [];
};

export const getUserIntelligence = async (): Promise<UserIntelligence[]> => {
    const response = await axios.get('/admin/analytics/user-intelligence');
    return Array.isArray(response.data) ? response.data : [];
};

export const getUserDirectory = async (query = '', page = 0, size = 15): Promise<PaginatedResponse<UserIntelligence>> => {
    const response = await axios.get(`/admin/analytics/users-directory?query=${query}&page=${page}&size=${size}`);
    return response.data;
};

export const getDetailedAiLogs = async (page = 0, size = 20): Promise<PaginatedResponse<DetailedAiLog>> => {
    const response = await axios.get(`/admin/logs/ai-detailed?page=${page}&size=${size}`);
    return response.data;
};
