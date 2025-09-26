import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CodeBracketIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FireIcon,
  CpuChipIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';
import { useToast } from './ToastNotifications';

const DeveloperMode = ({ 
  transactionData = null,
  networkInfo = null,
  gasEstimate = null,
  priceImpact = null,
  routeInfo = null 
}) => {
  const { isDeveloperMode } = useAppStore();
  const [expandedSections, setExpandedSections] = useState({
    transaction: true,
    network: false,
    gas: false,
    route: false,
    debug: false
  });
  const [copied, setCopied] = useState('');
  const toast = useToast();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success('Copié !', `${label} copié dans le presse-papier`);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      toast.error('Erreur', 'Impossible de copier dans le presse-papier');
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatGwei = (wei) => {
    if (!wei) return 'N/A';
    return `${(wei / 1e9).toFixed(2)} Gwei`;
  };

  const formatEther = (wei) => {
    if (!wei) return 'N/A';
    return `${(wei / 1e18).toFixed(6)} ETH`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'pending': return ClockIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return InformationCircleIcon;
    }
  };

  if (!isDeveloperMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 bg-gray-900 text-green-400 rounded-xl border border-gray-700 font-mono text-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CodeBracketIcon className="w-5 h-5" />
            <span className="font-semibold">Mode Développeur</span>
            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
              ACTIF
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Debug Info • Real-time Data
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Transaction Data */}
        {transactionData && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('transaction')}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>Transaction Data</span>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(transactionData.status)}`}>
                  {transactionData.status?.toUpperCase() || 'READY'}
                </span>
              </div>
              {expandedSections.transaction ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.transaction && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-gray-850 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">From Token</label>
                        <div className="flex items-center justify-between">
                          <span>{transactionData.fromToken || 'N/A'}</span>
                          <button
                            onClick={() => copyToClipboard(transactionData.fromToken, 'From Token')}
                            className="text-gray-400 hover:text-green-400 transition-colors"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">To Token</label>
                        <div className="flex items-center justify-between">
                          <span>{transactionData.toToken || 'N/A'}</span>
                          <button
                            onClick={() => copyToClipboard(transactionData.toToken, 'To Token')}
                            className="text-gray-400 hover:text-green-400 transition-colors"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">Amount In</label>
                        <div>{transactionData.amountIn || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Amount Out</label>
                        <div>{transactionData.amountOut || 'N/A'}</div>
                      </div>
                    </div>

                    {transactionData.hash && (
                      <div>
                        <label className="text-xs text-gray-400">Transaction Hash</label>
                        <div className="flex items-center justify-between">
                          <span>{formatAddress(transactionData.hash)}</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => copyToClipboard(transactionData.hash, 'Transaction Hash')}
                              className="text-gray-400 hover:text-green-400 transition-colors"
                            >
                              <ClipboardDocumentIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => window.open(`https://etherscan.io/tx/${transactionData.hash}`, '_blank')}
                              className="text-gray-400 hover:text-green-400 transition-colors"
                            >
                              <EyeIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Network Info */}
        {networkInfo && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('network')}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="w-4 h-4" />
                <span>Network Info</span>
                <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                  {networkInfo.name || 'Unknown'}
                </span>
              </div>
              {expandedSections.network ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.network && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-gray-850 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">Chain ID</label>
                        <div>{networkInfo.chainId || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Block Number</label>
                        <div>{networkInfo.blockNumber || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400">RPC URL</label>
                      <div className="flex items-center justify-between">
                        <span>{networkInfo.rpcUrl ? formatAddress(networkInfo.rpcUrl) : 'N/A'}</span>
                        {networkInfo.rpcUrl && (
                          <button
                            onClick={() => copyToClipboard(networkInfo.rpcUrl, 'RPC URL')}
                            className="text-gray-400 hover:text-green-400 transition-colors"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Gas Estimate */}
        {gasEstimate && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('gas')}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FireIcon className="w-4 h-4" />
                <span>Gas Analysis</span>
                <span className="text-xs px-2 py-1 bg-orange-900/30 text-orange-400 rounded">
                  {gasEstimate.gasLimit ? `${gasEstimate.gasLimit} units` : 'Estimating...'}
                </span>
              </div>
              {expandedSections.gas ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.gas && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-gray-850 space-y-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">Gas Limit</label>
                        <div>{gasEstimate.gasLimit || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Gas Price</label>
                        <div>{formatGwei(gasEstimate.gasPrice)}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Max Fee</label>
                        <div>{formatEther(gasEstimate.maxFee)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">Base Fee</label>
                        <div>{formatGwei(gasEstimate.baseFee)}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Priority Fee</label>
                        <div>{formatGwei(gasEstimate.priorityFee)}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Route Info */}
        {routeInfo && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('route')}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-4 h-4" />
                <span>Route Analysis</span>
                <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-400 rounded">
                  {routeInfo.hops ? `${routeInfo.hops} hops` : 'Direct'}
                </span>
              </div>
              {expandedSections.route ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.route && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-gray-850 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">DEX Used</label>
                        <div>{routeInfo.dex || 'Uniswap V3'}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Pool Fee</label>
                        <div>{routeInfo.poolFee ? `${routeInfo.poolFee / 10000}%` : 'N/A'}</div>
                      </div>
                    </div>
                    
                    {routeInfo.path && (
                      <div>
                        <label className="text-xs text-gray-400">Swap Path</label>
                        <div className="flex items-center space-x-2">
                          {routeInfo.path.map((token, index) => (
                            <React.Fragment key={index}>
                              <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                                {token}
                              </span>
                              {index < routeInfo.path.length - 1 && (
                                <span className="text-gray-500">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {priceImpact && (
                      <div>
                        <label className="text-xs text-gray-400">Price Impact</label>
                        <div className={`${priceImpact > 3 ? 'text-red-400' : priceImpact > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {priceImpact.toFixed(4)}%
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Debug Console */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('debug')}
            className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <CodeBracketIcon className="w-4 h-4" />
              <span>Debug Console</span>
              <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                Live Logs
              </span>
            </div>
            {expandedSections.debug ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.debug && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-gray-900 max-h-48 overflow-y-auto">
                  <div className="space-y-1 text-xs">
                    <div className="text-gray-500">
                      [{new Date().toLocaleTimeString()}] DEX Swap App initialized
                    </div>
                    <div className="text-blue-400">
                      [{new Date().toLocaleTimeString()}] Web3 provider detected: MetaMask
                    </div>
                    <div className="text-green-400">
                      [{new Date().toLocaleTimeString()}] Connected to network: Ethereum Mainnet
                    </div>
                    <div className="text-yellow-400">
                      [{new Date().toLocaleTimeString()}] Token prices updated via Uniswap quoter
                    </div>
                    <div className="text-gray-400">
                      [{new Date().toLocaleTimeString()}] Developer mode: ACTIVE
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>Debug mode provides detailed transaction and network information</span>
          <span>v2.0.0-dev</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DeveloperMode;
