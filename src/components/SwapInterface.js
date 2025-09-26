import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiArrowDown, FiSettings, FiZap } from 'react-icons/fi';
import TokenSelector from './TokenSelector';
import TransactionDetails from './TransactionDetails';
import { useWallet } from '../hooks/useWallet';
import { useSwap } from '../hooks/useSwap';
import { NETWORKS, DEFAULT_SLIPPAGE } from '../config/networks';
import './SwapInterface.css';

const SwapInterface = ({ onSwapSuccess, onError }) => {
  const {
    account,
    provider,
    signer,
    chainId,
    currentNetwork,
    isConnecting,
    error: walletError,
    connectWallet,
    switchNetwork,
    formatAddress
  } = useWallet();

  const {
    isLoading: swapLoading,
    error: swapError,
    quote,
    gasEstimate,
    getQuote,
    executeSwap,
    getTokenBalance,
    clearError
  } = useSwap(provider, signer, chainId);

  // État local
  const [networkIdx, setNetworkIdx] = useState(0);
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [showTokenSelector, setShowTokenSelector] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [balances, setBalances] = useState({});

  // Réseau et tokens actuels
  const network = NETWORKS[networkIdx];
  const tokens = network.tokens;

  // Vérifier si on est sur le bon réseau
  const isWrongNetwork = account && chainId && chainId !== network.chainId;

  // Charger les soldes
  useEffect(() => {
    const loadBalances = async () => {
      if (!account) return;

      const newBalances = {};
      for (const token of tokens) {
        try {
          const balance = await getTokenBalance(token.symbol, account);
          newBalances[token.symbol] = balance;
        } catch (err) {
          console.error(`Erreur chargement solde ${token.symbol}:`, err);
          newBalances[token.symbol] = '0';
        }
      }
      setBalances(newBalances);
    };

    loadBalances();
  }, [account, tokens, getTokenBalance, networkIdx]);

  // Obtenir un devis quand les paramètres changent
  useEffect(() => {
    if (amount && fromToken && toToken && account && !isWrongNetwork) {
      const timer = setTimeout(() => {
        getQuote(fromToken, toToken, amount);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timer);
    }
  }, [amount, fromToken, toToken, account, isWrongNetwork, getQuote]);

  // Gérer le changement de réseau
  const handleNetworkChange = async (newNetworkIdx) => {
    const newNetwork = NETWORKS[newNetworkIdx];
    setNetworkIdx(newNetworkIdx);

    // Réinitialiser les tokens si ils n'existent pas sur le nouveau réseau
    const newTokens = newNetwork.tokens;
    if (!newTokens.find(t => t.symbol === fromToken)) {
      setFromToken(newTokens[0].symbol);
    }
    if (!newTokens.find(t => t.symbol === toToken)) {
      setToToken(newTokens[1]?.symbol || newTokens[0].symbol);
    }

    // Changer de réseau si connecté
    if (account && chainId !== newNetwork.chainId) {
      await switchNetwork(newNetwork.chainId);
    }
  };

  // Inverser les tokens
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount(''); // Réinitialiser le montant
  };

  // Gérer la sélection de token
  const handleTokenSelect = (tokenSymbol, field) => {
    if (field === 'from') {
      setFromToken(tokenSymbol);
      if (tokenSymbol === toToken) {
        // Si on sélectionne le même token, inverser
        setToToken(fromToken);
      }
    } else {
      setToToken(tokenSymbol);
      if (tokenSymbol === fromToken) {
        // Si on sélectionne le même token, inverser
        setFromToken(toToken);
      }
    }
    setShowTokenSelector(null);
  };

  // Exécuter le swap
  const handleSwap = async () => {
    if (!quote || !account) return;

    try {
      clearError();
      const result = await executeSwap(quote, slippage);
      
      if (onSwapSuccess) {
        onSwapSuccess(result);
      }

      // Recharger les soldes après le swap
      setTimeout(() => {
        const loadBalances = async () => {
          const newBalances = {};
          for (const token of tokens) {
            try {
              const balance = await getTokenBalance(token.symbol, account);
              newBalances[token.symbol] = balance;
            } catch (err) {
              console.error(`Erreur rechargement solde ${token.symbol}:`, err);
            }
          }
          setBalances(newBalances);
        };
        loadBalances();
      }, 2000);

    } catch (err) {
      if (onError) {
        onError(err.message);
      }
    }
  };

  // Utiliser le solde maximum
  const handleMaxAmount = () => {
    const balance = balances[fromToken];
    if (balance && parseFloat(balance) > 0) {
      // Garder un peu d'ETH pour les frais de gas si c'est ETH
      if (fromToken === 'ETH') {
        const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
        setAmount(maxAmount.toString());
      } else {
        setAmount(balance);
      }
    }
  };

  // Formater le solde pour l'affichage
  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0';
    const num = parseFloat(balance);
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(6);
    return num.toFixed(4);
  };

  const error = walletError || swapError;

  return (
    <div className="swap-interface">
      {/* Sélection du réseau */}
      <div className="network-selector">
        <select
          value={networkIdx}
          onChange={(e) => handleNetworkChange(Number(e.target.value))}
          className="network-select"
        >
          {NETWORKS.map((net, idx) => (
            <option key={net.chainId} value={idx}>
              {net.name}
            </option>
          ))}
        </select>
        {isWrongNetwork && (
          <button
            onClick={() => switchNetwork(network.chainId)}
            className="switch-network-btn"
          >
            Changer de réseau
          </button>
        )}
      </div>

      {/* Interface de swap */}
      <div className="swap-card">
        <div className="swap-header">
          <h2>Swap</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="settings-btn"
            title="Paramètres"
          >
            <FiSettings />
          </button>
        </div>

        {/* Paramètres */}
        {showSettings && (
          <div className="settings-panel">
            <div className="setting-row">
              <label>Slippage toléré (%)</label>
              <div className="slippage-buttons">
                {[0.1, 0.5, 1.0].map(value => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={slippage === value ? 'active' : ''}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  className="slippage-custom"
                />
              </div>
            </div>
          </div>
        )}

        {account ? (
          <>
            {/* Wallet connecté */}
            <div className="wallet-info">
              <span>Connecté: {formatAddress(account)}</span>
              {currentNetwork && (
                <span className="network-badge">
                  {currentNetwork.name}
                </span>
              )}
            </div>

            {!isWrongNetwork ? (
              <>
                {/* Token source */}
                <div className="token-input-group">
                  <div className="token-input">
                    <div className="token-input-header">
                      <span>De</span>
                      <span className="balance">
                        Solde: {formatBalance(balances[fromToken])}
                        {balances[fromToken] && parseFloat(balances[fromToken]) > 0 && (
                          <button onClick={handleMaxAmount} className="max-btn">
                            MAX
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="token-input-main">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="amount-input"
                      />
                      <button
                        onClick={() => setShowTokenSelector('from')}
                        className="token-select-btn"
                      >
                        <img 
                          src={tokens.find(t => t.symbol === fromToken)?.logo} 
                          alt={fromToken}
                          className="token-logo"
                        />
                        <span>{fromToken}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bouton d'inversion */}
                <div className="swap-arrow">
                  <button onClick={handleSwapTokens} className="swap-arrow-btn">
                    <FiArrowDown />
                  </button>
                </div>

                {/* Token destination */}
                <div className="token-input-group">
                  <div className="token-input">
                    <div className="token-input-header">
                      <span>Vers</span>
                      <span className="balance">
                        Solde: {formatBalance(balances[toToken])}
                      </span>
                    </div>
                    <div className="token-input-main">
                      <input
                        type="text"
                        placeholder="0.0"
                        value={quote ? Number(quote.amountOut).toFixed(6) : ''}
                        readOnly
                        className="amount-input readonly"
                      />
                      <button
                        onClick={() => setShowTokenSelector('to')}
                        className="token-select-btn"
                      >
                        <img 
                          src={tokens.find(t => t.symbol === toToken)?.logo} 
                          alt={toToken}
                          className="token-logo"
                        />
                        <span>{toToken}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails de la transaction */}
                {quote && (
                  <TransactionDetails
                    quote={quote}
                    gasEstimate={gasEstimate}
                    slippage={slippage}
                    network={network}
                    onSlippageChange={setSlippage}
                  />
                )}

                {/* Bouton de swap */}
                <button
                  onClick={handleSwap}
                  disabled={!quote || swapLoading || !amount || parseFloat(amount) <= 0}
                  className="swap-btn"
                >
                  {swapLoading ? (
                    <>
                      <div className="spinner" />
                      Swap en cours...
                    </>
                  ) : (
                    <>
                      <FiZap />
                      Swap {fromToken} → {toToken}
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="wrong-network">
                <p>Vous êtes sur le mauvais réseau</p>
                <button
                  onClick={() => switchNetwork(network.chainId)}
                  className="switch-network-btn"
                >
                  Passer à {network.name}
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="connect-btn"
          >
            {isConnecting ? 'Connexion...' : 'Connecter MetaMask'}
          </button>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Sélecteur de tokens */}
      {showTokenSelector && (
        <TokenSelector
          tokens={tokens}
          selectedToken={showTokenSelector === 'from' ? fromToken : toToken}
          excludeToken={showTokenSelector === 'from' ? toToken : fromToken}
          onTokenSelect={(symbol) => handleTokenSelect(symbol, showTokenSelector)}
          onClose={() => setShowTokenSelector(null)}
          userAddress={account}
          getTokenBalance={getTokenBalance}
        />
      )}
    </div>
  );
};

export default SwapInterface;
