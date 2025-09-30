import React, { useState, useEffect } from 'react';
import './App.css';

// Hooks
import { useWallet } from './hooks/useWallet';
import { useSwap } from './hooks/useSwap';

// Config
import { NETWORKS } from './config/networks';

function App() {
  const [selectedFromToken, setSelectedFromToken] = useState('ETH');
  const [selectedToToken, setSelectedToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

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
    gasEstimate
  } = useSwap();

  // Appliquer le thème
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  const handleSwap = async () => {
    if (!isConnected) {
      alert('Veuillez connecter votre wallet pour continuer');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert('Veuillez saisir un montant valide');
      return;
    }

    try {
      const txHash = await executeSwap({
        fromToken: selectedFromToken,
        toToken: selectedToToken,
        amount: fromAmount,
        slippage: slippage
      });

      alert(`Transaction envoyée ! Hash: ${txHash}`);
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const swapTokens = () => {
    const temp = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(temp);
    setFromAmount('');
  };

  const currentNetwork = NETWORKS.find(n => n.chainId === network?.chainId);
  const availableTokens = currentNetwork?.tokens || [];

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">D</div>
            <div>
              <h1>DEX Swap</h1>
              <p>L'avenir du trading décentralisé</p>
            </div>
          </div>

          <div className="header-controls">
            <button 
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button 
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Paramètres"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="swap-container">
          <div className="swap-card">
            <div className="swap-header">
              <h2>Swap</h2>
              <button className="refresh-btn" title="Actualiser les prix">
                🔄
              </button>
            </div>

            {/* From Token */}
            <div className="token-input">
              <div className="token-input-header">
                <span>De</span>
                {isConnected && (
                  <span className="balance">
                    Solde: {getTokenBalance(selectedFromToken) || '0.00'}
                  </span>
                )}
              </div>
              <div className="token-input-content">
                <input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="amount-input"
                />
                <select 
                  value={selectedFromToken}
                  onChange={(e) => setSelectedFromToken(e.target.value)}
                  className="token-select"
                >
                  {availableTokens.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="swap-arrow-container">
              <button className="swap-arrow" onClick={swapTokens}>
                ↕️
              </button>
            </div>

            {/* To Token */}
            <div className="token-input">
              <div className="token-input-header">
                <span>Vers</span>
                {isConnected && (
                  <span className="balance">
                    Solde: {getTokenBalance(selectedToToken) || '0.00'}
                  </span>
                )}
              </div>
              <div className="token-input-content">
                <input
                  type="text"
                  placeholder="0.0"
                  value={quote?.amountOut || ''}
                  readOnly
                  className="amount-input"
                />
                <select 
                  value={selectedToToken}
                  onChange={(e) => setSelectedToToken(e.target.value)}
                  className="token-select"
                >
                  {availableTokens.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transaction Details */}
            {quote && (
              <div className="transaction-details">
                <div className="detail-row">
                  <span>Prix d'impact</span>
                  <span className={priceImpact > 3 ? 'warning' : ''}>
                    {priceImpact?.toFixed(2)}%
                  </span>
                </div>
                <div className="detail-row">
                  <span>Frais de gas estimés</span>
                  <span>{gasEstimate} ETH</span>
                </div>
                <div className="detail-row">
                  <span>Slippage</span>
                  <span>{slippage}%</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="action-section">
              {!isConnected ? (
                <button className="connect-btn" onClick={connectWallet}>
                  Connecter MetaMask
                </button>
              ) : (
                <button 
                  className="swap-btn"
                  onClick={handleSwap}
                  disabled={isLoading || !fromAmount}
                >
                  {isLoading ? 'Échange en cours...' : 'Échanger'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Paramètres</h3>
            
            <div className="setting-group">
              <label>Slippage par défaut (%)</label>
              <input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="setting-input"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Effects */}
      <div className="background-effects">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
    </div>
  );
}

export default App;
