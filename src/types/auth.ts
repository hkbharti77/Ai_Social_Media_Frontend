export interface User {
  id: string | number;
  email: string;
  name?: string;
  roles?: string[];
  monthlyCredits?: number;
  dailyCreditsUsed?: number;
  subscriptionTier?: string;
  purchasedModelIds?: string[];
}
