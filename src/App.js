import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SunIcon, 
  MoonIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

// Components
import SwapInterface from './components/SwapInterface';
import SmartTokenSearch from './components/SmartTokenSearch';
import InteractiveTutorial from './components/InteractiveTutorial';
import ToastNotifications from './components/ToastNotifications';
import PriceChart from './components/PriceChart';
import DeveloperMode from './components/DeveloperMode';

// Hooks and Store
import { useWallet } from './hooks/useWallet';
import { useSwap } from './hooks/useSwap';
import { useAppStore } from './store/useAppStore';
import { useToast } from './components/ToastNotifications';

// Config
import { NETWORKS } from './config/networks';

// Styles
import './App.css';

function App() {
  const [selectedFromToken, setSelectedFromToken] = useState('ETH');
  const [selectedToToken, setSelectedToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [tokenSelectorType, setTokenSelectorType] = useState('from');
  const [showSettings, setShowSettings] = useState(false);
  const [showPriceChart, setShowPriceChart] = useState(false);

  // Store
  const { 
    isDarkMode, 
    toggleTheme, 
    isDeveloperMode, 
    toggleDeveloperMode,
    hasCompletedOnboarding,
    ui,
    updateUI,
    preferences,
    updatePreferences
  } = useAppStore();

  // Hooks
  const { 
    account, 
    isConnected, 
    network, 
    connectWallet, 
    switchNetwork,
    getTokenBalance 
  } = useWallet();

  const {
    quote,
    isLoading,
    executeSwap,
    priceImpact,
    gasEstimate,
    routeInfo
  } = useSwap();

  const toast = useToast();

  // Appliquer le thème
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Vérifier les mises à jour
  useEffect(() => {
    // Simuler une vérification de mise à jour
    const checkForUpdates = () => {
      if (Math.random() < 0.1) { // 10% de chance
        toast.appUpdate();
      }
    };

    const timer = setTimeout(checkForUpdates, 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleTokenSelect = (tokenSymbol) => {
    if (tokenSelectorType === 'from') {
      if (tokenSymbol === selectedToToken) {
        // Swap automatique si même token
        setSelectedToToken(selectedFromToken);
      }
      setSelectedFromToken(tokenSymbol);
    } else {
      if (tokenSymbol === selectedFromToken) {
        // Swap automatique si même token
        setSelectedFromToken(selectedToToken);
      }
      setSelectedToToken(tokenSymbol);
    }
    setShowTokenSelector(false);
  };

  const openTokenSelector = (type) => {
    setTokenSelectorType(type);
    setShowTokenSelector(true);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      toast.warning('Wallet requis', 'Veuillez connecter votre wallet pour continuer');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Montant invalide', 'Veuillez saisir un montant valide');
      return;
    }

    try {
      const txHash = await executeSwap({
        fromToken: selectedFromToken,
        toToken: selectedToToken,
        amount: fromAmount,
        slippage: preferences.defaultSlippage
      });

      toast.transactionPending(txHash);
      
      // Simuler la confirmation (à remplacer par un vrai listener)
      setTimeout(() => {
        toast.transactionSuccess(txHash, {
          description: `Échange de ${fromAmount} ${selectedFromToken} vers ${selectedToToken} réussi !`
        });
        
        // Ajouter le token au wallet si activé
        if (preferences.autoAddTokenToWallet) {
          // Logique d'ajout du token à MetaMask
          toast.tokenAdded(selectedToToken);
        }
      }, 3000);

    } catch (error) {
      toast.transactionError(error);
    }
  };

  const swapTokens = () => {
    const temp = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(temp);
    setFromAmount(''); // Reset amount
  };

  const currentNetwork = NETWORKS.find(n => n.chainId === network?.chainId);
  const availableTokens = currentNetwork?.tokens || [];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">DEX Swap</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                L'avenir du trading décentralisé
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            {/* Price Chart Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPriceChart(!showPriceChart)}
              className={`p-2 rounded-xl backdrop-blur-sm border transition-all ${
                showPriceChart
                  ? 'bg-primary-500/20 border-primary-500/30 text-primary-600 dark:text-primary-400'
                  : 'bg-white/10 dark:bg-gray-800/50 border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700/50'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
            </motion.button>

            {/* Developer Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDeveloperMode}
              className={`p-2 rounded-xl backdrop-blur-sm border transition-all ${
                isDeveloperMode
                  ? 'bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400'
                  : 'bg-white/10 dark:bg-gray-800/50 border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700/50'
              }`}
            >
              <CodeBracketIcon className="w-5 h-5" />
            </motion.button>

            {/* Tutorial */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateUI({ showTutorial: true })}
              className="p-2 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all"
            >
              <AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="settings-btn p-2 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all"
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Chart */}
            <AnimatePresence>
              {showPriceChart && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-1"
                >
                  <PriceChart 
                    tokenSymbol={selectedFromToken}
                    className="h-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swap Interface */}
            <div className={`${showPriceChart ? 'lg:col-span-2' : 'lg:col-span-3'} max-w-2xl mx-auto`}>
              <SwapInterface
                selectedFromToken={selectedFromToken}
                selectedToToken={selectedToToken}
                fromAmount={fromAmount}
                setFromAmount={setFromAmount}
                onTokenSelect={openTokenSelector}
                onSwapTokens={swapTokens}
                onSwap={handleSwap}
                account={account}
                isConnected={isConnected}
                connectWallet={connectWallet}
                network={network}
                switchNetwork={switchNetwork}
                quote={quote}
                isLoading={isLoading}
                priceImpact={priceImpact}
                gasEstimate={gasEstimate}
                availableTokens={availableTokens}
                getTokenBalance={getTokenBalance}
              />

              {/* Developer Mode */}
              <DeveloperMode
                transactionData={{
                  fromToken: selectedFromToken,
                  toToken: selectedToToken,
                  amountIn: fromAmount,
                  amountOut: quote?.amountOut,
                  status: 'ready'
                }}
                networkInfo={{
                  name: network?.name,
                  chainId: network?.chainId,
                  blockNumber: network?.blockNumber,
                  rpcUrl: network?.rpcUrl
                }}
                gasEstimate={gasEstimate}
                priceImpact={priceImpact}
                routeInfo={routeInfo}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Token Selector Modal */}
      <SmartTokenSearch
        tokens={availableTokens}
        onTokenSelect={handleTokenSelect}
        excludeToken={tokenSelectorType === 'from' ? selectedToToken : selectedFromToken}
        isOpen={showTokenSelector}
        onClose={() => setShowTokenSelector(false)}
        getTokenBalance={getTokenBalance}
        userAddress={account}
      />

      {/* Interactive Tutorial */}
      <InteractiveTutorial />

      {/* Toast Notifications */}
      <ToastNotifications />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Paramètres
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slippage par défaut (%)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={preferences.defaultSlippage}
                      onChange={(e) => updatePreferences({ defaultSlippage: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ajouter automatiquement les tokens
                    </span>
                    <button
                      onClick={() => updatePreferences({ autoAddTokenToWallet: !preferences.autoAddTokenToWallet })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.autoAddTokenToWallet ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.autoAddTokenToWallet ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications
                    </span>
                    <button
                      onClick={() => updatePreferences({ enableNotifications: !preferences.enableNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.enableNotifications ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
