import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { subscriptionService, SubscriptionStatus } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  refreshSubscriptionStatus: () => Promise<void>;
  checkPremiumFeature: (featureName: string, showPrompt?: boolean) => boolean;
  openUpgradeScreen: () => void;
  setNavigationRef: (ref: any) => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigationRef, setNavigationRef] = useState<any>(null);

  // Fetch subscription status when user logs in
  useEffect(() => {
    if (user) {
      refreshSubscriptionStatus();
    } else {
      setIsPremium(false);
      setSubscriptionStatus(null);
      setLoading(false);
    }
  }, [user]);

  const refreshSubscriptionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      const effectiveIsPremium = (user.isAdmin ?? false) || status.isPremium;
      setIsPremium(effectiveIsPremium);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setIsPremium(!!user?.isAdmin);
    } finally {
      setLoading(false);
    }
  };

  const openUpgradeScreen = () => {
    if (navigationRef) {
      navigationRef.navigate('PremiumUpgrade');
    }
  };

  const checkPremiumFeature = (featureName: string, showPrompt: boolean = true): boolean => {
    if (isPremium) {
      return true;
    }

    if (showPrompt) {
      Alert.alert(
        '✨ Premium Feature',
        `"${featureName}" is a premium feature. Upgrade to Premium for unlimited access!`,
        [
          {
            text: 'Maybe Later',
            style: 'cancel',
          },
          {
            text: 'Upgrade Now',
            onPress: openUpgradeScreen,
          },
        ],
      );
    }

    return false;
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        subscriptionStatus,
        loading,
        refreshSubscriptionStatus,
        checkPremiumFeature,
        openUpgradeScreen,
        setNavigationRef,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
