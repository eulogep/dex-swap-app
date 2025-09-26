import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  StarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAppStore } from '../store/useAppStore';

const SmartTokenSearch = ({ 
  tokens, 
  onTokenSelect, 
  excludeToken,
  isOpen,
  onClose,
  getTokenBalance,
  userAddress 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [balances, setBalances] = useState({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const searchInputRef = useRef(null);
  
  const { 
    favoriteTokens, 
    addFavoriteToken, 
    removeFavoriteToken,
    swapHistory 
  } = useAppStore();

  // Charger les soldes
  useEffect(() => {
    const loadBalances = async () => {
      if (!userAddress || !getTokenBalance) return;
      
      setIsLoadingBalances(true);
      const newBalances = {};
      
      try {
        await Promise.all(
          tokens.map(async (token) => {
            try {
              const balance = await getTokenBalance(token.symbol, userAddress);
              newBalances[token.symbol] = balance;
            } catch (err) {
              newBalances[token.symbol] = '0';
            }
          })
        );
        setBalances(newBalances);
      } catch (err) {
        console.error('Erreur chargement soldes:', err);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    if (isOpen) {
      loadBalances();
    }
  }, [tokens, userAddress, getTokenBalance, isOpen]);

  // Filtrer et trier les tokens
  useEffect(() => {
    let filtered = tokens.filter(token => {
      if (excludeToken && token.symbol === excludeToken) return false;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower) ||
        token.address.toLowerCase().includes(searchLower)
      );
    });

    // Trier par pertinence
    filtered.sort((a, b) => {
      const aBalance = parseFloat(balances[a.symbol] || '0');
      const bBalance = parseFloat(balances[b.symbol] || '0');
      const aIsFavorite = favoriteTokens.includes(a.symbol);
      const bIsFavorite = favoriteTokens.includes(b.symbol);
      
      // Priorité: favoris > avec solde > alphabétique
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      if (aBalance > 0 && bBalance === 0) return -1;
      if (aBalance === 0 && bBalance > 0) return 1;
      if (aBalance !== bBalance) return bBalance - aBalance;
      
      return a.symbol.localeCompare(b.symbol);
    });

    setFilteredTokens(filtered);
    setSelectedIndex(0);
  }, [searchTerm, tokens, excludeToken, balances, favoriteTokens]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredTokens.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredTokens.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTokens[selectedIndex]) {
            handleTokenSelect(filteredTokens[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTokens, selectedIndex, onClose]);

  // Focus automatique
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleTokenSelect = (token) => {
    onTokenSelect(token.symbol);
    onClose();
    setSearchTerm('');
  };

  const toggleFavorite = (e, tokenSymbol) => {
    e.stopPropagation();
    if (favoriteTokens.includes(tokenSymbol)) {
      removeFavoriteToken(tokenSymbol);
    } else {
      addFavoriteToken(tokenSymbol);
    }
  };

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0';
    const num = parseFloat(balance);
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  };

  const getRecentlyUsedTokens = () => {
    const recentTokens = new Set();
    swapHistory.slice(0, 10).forEach(swap => {
      recentTokens.add(swap.fromToken);
      recentTokens.add(swap.toToken);
    });
    return Array.from(recentTokens).slice(0, 5);
  };

  const getPriceChange = (token) => {
    // Simulation de changement de prix (à remplacer par vraies données)
    const changes = {
      'ETH': 2.5,
      'BTC': -1.2,
      'USDC': 0.1,
      'DAI': -0.05,
      'LINK': 5.8,
      'UNI': -3.2,
    };
    return changes[token.symbol] || 0;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sélectionner un token
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher par nom, symbole ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Suggestions rapides */}
          {!searchTerm && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" />
                  Favoris
                </h4>
                <div className="flex flex-wrap gap-2">
                  {favoriteTokens.slice(0, 4).map(symbol => {
                    const token = tokens.find(t => t.symbol === symbol);
                    if (!token || token.symbol === excludeToken) return null;
                    return (
                      <button
                        key={symbol}
                        onClick={() => handleTokenSelect(token)}
                        className="flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <img src={token.logo} alt={symbol} className="w-4 h-4 mr-1.5 rounded-full" />
                        {symbol}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {getRecentlyUsedTokens().length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Récemment utilisés
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getRecentlyUsedTokens().slice(0, 3).map(symbol => {
                      const token = tokens.find(t => t.symbol === symbol);
                      if (!token || token.symbol === excludeToken) return null;
                      return (
                        <button
                          key={symbol}
                          onClick={() => handleTokenSelect(token)}
                          className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <img src={token.logo} alt={symbol} className="w-4 h-4 mr-1.5 rounded-full" />
                          {symbol}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Liste des tokens */}
          <div className="max-h-80 overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun token trouvé pour "{searchTerm}"</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredTokens.map((token, index) => {
                  const balance = balances[token.symbol];
                  const isFavorite = favoriteTokens.includes(token.symbol);
                  const isSelected = index === selectedIndex;
                  const priceChange = getPriceChange(token);
                  
                  return (
                    <motion.div
                      key={token.symbol}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                      `}
                      onClick={() => handleTokenSelect(token)}
                    >
                      <div className="flex items-center flex-1">
                        <div className="relative">
                          <img 
                            src={token.logo} 
                            alt={token.symbol}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {isFavorite && (
                            <StarIconSolid className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {token.symbol}
                            </span>
                            {priceChange !== 0 && (
                              <div className={`ml-2 flex items-center text-xs ${
                                priceChange > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {priceChange > 0 ? (
                                  <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
                                ) : (
                                  <ArrowTrendingDownIcon className="w-3 h-3 mr-0.5" />
                                )}
                                {Math.abs(priceChange).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {token.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {userAddress && (
                          <div className="text-right">
                            {isLoadingBalances ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatBalance(balance)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={(e) => toggleFavorite(e, token.symbol)}
                          className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          {isFavorite ? (
                            <StarIconSolid className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <StarIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Utilisez ↑↓ pour naviguer, Entrée pour sélectionner, Échap pour fermer
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartTokenSearch;
