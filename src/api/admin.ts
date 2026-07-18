import axios from "./axios";

// ============= EXISTING TYPES =============
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

// ============= NEW ADMIN MANAGEMENT TYPES =============

export interface UserActionResponse {
    id: number;
    email: string;
    isActive: boolean;
    subscriptionTier: string;
    subscriptionExpiresAt: string | null;
    monthlyCredits: number;
    bonusCredits: number;
}

export interface AdminUserProfile {
    id: number;
    email: string;
    fullName: string;
    isActive: boolean;
    subscriptionTier: string;
    subscriptionExpiresAt: string | null;
    monthlyCredits: number;
    bonusCredits: number;
    registrationIp: string | null;
    deviceFingerprint: string | null;
    isFraudFlagged: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    loginCount: number;
    totalTokensUsed: number;
    totalCreditsSpent: number;
}

export interface FraudFlaggedUser {
    id: number;
    email: string;
    fullName: string;
    isActive: boolean;
    subscriptionTier: string;
    registrationIp: string | null;
    isFraudFlagged: boolean;
}

export interface SuspiciousRegistrations {
    duplicateIps: DuplicateIpGroup[];
    duplicateFingerprints: DuplicateFingerprintGroup[];
}

export interface DuplicateIpGroup {
    registrationIp: string;
    count: number;
    users: UserSummary[];
}

export interface DuplicateFingerprintGroup {
    deviceFingerprint: string;
    count: number;
    users: UserSummary[];
}

export interface UserSummary {
    id: number;
    email: string;
    fullName: string;
    createdAt: string;
}

export interface PaymentOrder {
    id: number;
    user: {
        id: number;
        email: string;
        fullName: string;
    };
    amount: number;
    currency: string;
    status: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    pricingTier: {
        id: number;
        name: string;
    };
    createdAt: string;
}

export interface RevenueStats {
    totalRevenue: number;
    monthlyRevenue: number;
    dailyRevenue: number;
    totalPayments: number;
    monthlyPayments: number;
    currency: string;
}

export interface CreditUsage {
    id: number;
    user: {
        id: number;
        email: string;
        fullName: string;
    };
    creditsUsed: number;
    purpose: string;
    createdAt: string;
}

export interface CreditStats {
    totalCreditsUsed: number;
    monthlyCreditsUsed: number;
    topUsers: TopCreditUser[];
    creditsByPurpose: CreditByPurpose[];
}

export interface TopCreditUser {
    userId: number;
    email: string;
    totalCredits: number;
}

export interface CreditByPurpose {
    purpose: string;
    total: number;
}

export interface AdminPost {
    id: number;
    user: {
        id: number;
        email: string;
        fullName: string;
    };
    caption: string;
    status: string;
    platform: string;
    scheduledFor: string | null;
    publishedAt: string | null;
    createdAt: string;
}

export interface PostStats {
    totalPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    publishedPosts: number;
    failedPosts: number;
    monthlyPosts: number;
    dailyPublished: number;
}

export interface PricingTier {
    id: number;
    name: string;
    displayName: string;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyCredits: number;
    features: string[];
    isActive: boolean;
}

export interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    fraudFlaggedUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalCreditsUsed: number;
    monthlyCreditsUsed: number;
    totalPosts: number;
    monthlyPosts: number;
    totalAiTokens: number;
    monthlyAiTokens: number;
}

export interface CreditAdjustmentRequest {
    amount: number;
    creditType: 'MONTHLY' | 'BONUS';
    reason: string;
}

export interface SubscriptionChangeRequest {
    subscriptionTier: string;
}

export interface BroadcastEmailRequest {
    subject: string;
    htmlBody: string;
    targetTier: string; // "ALL", specific tier, or "SPECIFIC"
    targetEmail?: string; // Optional, used if targetTier is "SPECIFIC"
}

export interface BroadcastEmailResponse {
    recipientCount: number;
    status: string;
}

// ============= EXISTING API CALLS =============

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

// ============= NEW ADMIN MANAGEMENT API CALLS =============

// User Management
export const banUser = async (userId: number): Promise<UserActionResponse> => {
    const response = await axios.post(`/admin/users/${userId}/ban`);
    return response.data;
};

export const unbanUser = async (userId: number): Promise<UserActionResponse> => {
    const response = await axios.post(`/admin/users/${userId}/unban`);
    return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await axios.delete(`/admin/users/${userId}`);
};

export const bulkDeleteUsers = async (userIds: number[]): Promise<{ message: string; totalRequested: number; successfullyDeleted: number }> => {
    const response = await axios.delete(`/admin/users/bulk`, { data: userIds });
    return response.data;
};

export const getUserProfile = async (userId: number): Promise<AdminUserProfile> => {
    const response = await axios.get(`/admin/users/${userId}/profile`);
    return response.data;
};

export const changeSubscription = async (
    userId: number,
    request: SubscriptionChangeRequest
): Promise<UserActionResponse> => {
    const response = await axios.put(`/admin/users/${userId}/subscription`, request);
    return response.data;
};

export const addCredits = async (
    userId: number,
    request: CreditAdjustmentRequest
): Promise<UserActionResponse> => {
    const response = await axios.post(`/admin/users/${userId}/credits/add`, request);
    return response.data;
};

export const deductCredits = async (
    userId: number,
    request: CreditAdjustmentRequest
): Promise<UserActionResponse> => {
    const response = await axios.post(`/admin/users/${userId}/credits/deduct`, request);
    return response.data;
};

// Fraud & Security
export const getFraudFlaggedUsers = async (
    page = 0,
    size = 20
): Promise<PaginatedResponse<FraudFlaggedUser>> => {
    const response = await axios.get(`/admin/users/fraud-flagged?page=${page}&size=${size}`);
    return response.data;
};

export const setFraudFlag = async (userId: number): Promise<void> => {
    await axios.post(`/admin/users/${userId}/fraud-flag`);
};

export const clearFraudFlag = async (userId: number): Promise<void> => {
    await axios.delete(`/admin/users/${userId}/fraud-flag`);
};

export const getSuspiciousRegistrations = async (): Promise<SuspiciousRegistrations> => {
    const response = await axios.get('/admin/users/suspicious-registrations');
    return response.data;
};

// Payments & Revenue
export const getAllPayments = async (
    status?: string,
    page = 0,
    size = 20
): Promise<PaginatedResponse<PaymentOrder>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    const response = await axios.get(`/admin/payments?${params.toString()}`);
    return response.data;
};

export const getRevenueStats = async (): Promise<RevenueStats> => {
    const response = await axios.get('/admin/payments/revenue-stats');
    return response.data;
};

export const getUserPayments = async (userId: number): Promise<PaymentOrder[]> => {
    const response = await axios.get(`/admin/users/${userId}/payments`);
    return response.data;
};

// Credit Management
export const getCreditUsageHistory = async (
    userId?: number,
    page = 0,
    size = 20
): Promise<PaginatedResponse<CreditUsage>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (userId) params.append('userId', userId.toString());
    const response = await axios.get(`/admin/credits/usage?${params.toString()}`);
    return response.data;
};

export const getCreditStats = async (): Promise<CreditStats> => {
    const response = await axios.get('/admin/credits/stats');
    return response.data;
};

// Content Moderation
export const getAllPosts = async (
    status?: string,
    userId?: number,
    page = 0,
    size = 20
): Promise<PaginatedResponse<AdminPost>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId.toString());
    const response = await axios.get(`/admin/posts?${params.toString()}`);
    return response.data;
};

export const deletePost = async (postId: number): Promise<void> => {
    await axios.delete(`/admin/posts/${postId}`);
};

export const getPostStats = async (): Promise<PostStats> => {
    const response = await axios.get('/admin/posts/stats');
    return response.data;
};

// Pricing Management
export const getAllPricingTiers = async (): Promise<PricingTier[]> => {
    const response = await axios.get('/admin/pricing');
    return response.data;
};

export const updatePricingTier = async (tierId: number, tier: Partial<PricingTier>): Promise<PricingTier> => {
    const response = await axios.put(`/admin/pricing/${tierId}`, tier);
    return response.data;
};

// Broadcast Email
export const broadcastEmail = async (request: BroadcastEmailRequest): Promise<BroadcastEmailResponse> => {
    const response = await axios.post('/admin/broadcast/email', request);
    return response.data;
};

// System Stats
export const getSystemStats = async (): Promise<SystemStats> => {
    const response = await axios.get('/admin/system/stats');
    return response.data;
};

// User Summaries for dropdowns
export const getUserSummaries = async (): Promise<{ userId: number; email: string }[]> => {
    const response = await axios.get('/admin/users/summaries');
    return response.data;
};
