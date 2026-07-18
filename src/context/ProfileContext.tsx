import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getProfile, type ProfileResponse } from '../api/profile';
import { useAuth } from './useAuth';

interface ProfileContextType {
  subscription: ProfileResponse['subscription'] | null;
  profile: ProfileResponse['profile'] | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse['profile'] | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setSubscription(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getProfile();
      setSubscription(data.subscription);
      setProfile(data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Clear profile data on error (e.g., token expired)
      setSubscription(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh profile when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    } else {
      // Clear profile data when logged out
      setSubscription(null);
      setProfile(null);
    }
  }, [isAuthenticated, refreshProfile]);

  return (
    <ProfileContext.Provider value={{ subscription, profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
