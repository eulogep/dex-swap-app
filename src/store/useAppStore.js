import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// Store principal de l'application
export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      isDarkMode: true,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Onboarding
      hasCompletedOnboarding: false,
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      
      // Mode développeur
      isDeveloperMode: false,
      toggleDeveloperMode: () => set((state) => ({ isDeveloperMode: !state.isDeveloperMode })),
      
      // Préférences utilisateur
      preferences: {
        defaultSlippage: 0.5,
        showPriceImpactWarning: true,
        autoAddTokenToWallet: true,
        enableNotifications: true,
        preferredCurrency: 'USD',
        language: 'fr',
      },
      updatePreferences: (newPreferences) => 
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        })),
      
      // Historique des swaps
      swapHistory: [],
      addSwapToHistory: (swap) => 
        set((state) => ({
          swapHistory: [
            {
              ...swap,
              id: Date.now(),
              timestamp: new Date().toISOString(),
            },
            ...state.swapHistory.slice(0, 99) // Garder seulement les 100 derniers
          ]
        })),
      clearSwapHistory: () => set({ swapHistory: [] }),
      
      // Tokens favoris
      favoriteTokens: ['ETH', 'USDC', 'WBTC'],
      addFavoriteToken: (tokenSymbol) =>
        set((state) => ({
          favoriteTokens: state.favoriteTokens.includes(tokenSymbol)
            ? state.favoriteTokens
            : [...state.favoriteTokens, tokenSymbol]
        })),
      removeFavoriteToken: (tokenSymbol) =>
        set((state) => ({
          favoriteTokens: state.favoriteTokens.filter(token => token !== tokenSymbol)
        })),
      
      // Alertes de prix
      priceAlerts: [],
      addPriceAlert: (alert) =>
        set((state) => ({
          priceAlerts: [
            ...state.priceAlerts,
            {
              ...alert,
              id: Date.now(),
              createdAt: new Date().toISOString(),
              isActive: true,
            }
          ]
        })),
      removePriceAlert: (alertId) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter(alert => alert.id !== alertId)
        })),
      togglePriceAlert: (alertId) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.map(alert =>
            alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
          )
        })),
      
      // Interface utilisateur
      ui: {
        sidebarOpen: false,
        showAdvancedSettings: false,
        activeTab: 'swap',
        showTutorial: false,
      },
      updateUI: (updates) =>
        set((state) => ({
          ui: { ...state.ui, ...updates }
        })),
      
      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now(),
              timestamp: new Date().toISOString(),
              read: false,
            }
          ]
        })),
      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        })),
      removeNotification: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.filter(notif => notif.id !== notificationId)
        })),
      clearAllNotifications: () => set({ notifications: [] }),
      
      // Performance et analytics
      analytics: {
        totalSwaps: 0,
        totalVolume: 0,
        averageSlippage: 0,
        favoriteTokenPairs: {},
      },
      updateAnalytics: (updates) =>
        set((state) => ({
          analytics: { ...state.analytics, ...updates }
        })),
      
      // Fonctions utilitaires
      reset: () => set({
        hasCompletedOnboarding: false,
        swapHistory: [],
        favoriteTokens: ['ETH', 'USDC', 'WBTC'],
        priceAlerts: [],
        notifications: [],
        analytics: {
          totalSwaps: 0,
          totalVolume: 0,
          averageSlippage: 0,
          favoriteTokenPairs: {},
        },
      }),
    }),
    {
      name: 'dex-swap-app-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isDeveloperMode: state.isDeveloperMode,
        preferences: state.preferences,
        swapHistory: state.swapHistory,
        favoriteTokens: state.favoriteTokens,
        priceAlerts: state.priceAlerts,
        analytics: state.analytics,
      }),
    }
  )
);

// Store pour les données de marché
export const useMarketStore = create((set, get) => ({
  // Prix des tokens
  tokenPrices: {},
  setTokenPrice: (symbol, price) =>
    set((state) => ({
      tokenPrices: { ...state.tokenPrices, [symbol]: price }
    })),
  
  // Données de marché
  marketData: {},
  setMarketData: (symbol, data) =>
    set((state) => ({
      marketData: { ...state.marketData, [symbol]: data }
    })),
  
  // Tendances
  trends: {},
  setTrends: (trends) => set({ trends }),
  
  // Dernière mise à jour
  lastUpdate: null,
  setLastUpdate: () => set({ lastUpdate: new Date().toISOString() }),
}));

// Store pour les notifications toast
export const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto-remove après la durée spécifiée
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    })),
  
  clearAllToasts: () => set({ toasts: [] }),
}));
