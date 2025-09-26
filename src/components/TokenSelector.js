import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './TokenSelector.css';

const TokenSelector = ({ 
  tokens, 
  selectedToken, 
  onTokenSelect, 
  onClose, 
  userAddress,
  getTokenBalance,
  excludeToken = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [balances, setBalances] = useState({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Filtrer les tokens selon la recherche et exclure le token sélectionné dans l'autre champ
  const filteredTokens = tokens.filter(token => {
    if (excludeToken && token.symbol === excludeToken) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(searchLower) ||
      token.name.toLowerCase().includes(searchLower) ||
      token.address.toLowerCase().includes(searchLower)
    );
  });

  // Charger les soldes des tokens
  useEffect(() => {
    const loadBalances = async () => {
      if (!userAddress || !getTokenBalance) return;

      setIsLoadingBalances(true);
      const newBalances = {};

      try {
        await Promise.all(
          filteredTokens.map(async (token) => {
            try {
              const balance = await getTokenBalance(token.symbol, userAddress);
              newBalances[token.symbol] = balance;
            } catch (err) {
              console.error(`Erreur chargement solde ${token.symbol}:`, err);
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

    loadBalances();
  }, [filteredTokens, userAddress, getTokenBalance]);

  // Formater le solde pour l'affichage
  const formatBalance = (balance, decimals = 18) => {
    if (!balance || balance === '0') return '0';
    
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  };

  // Gérer la sélection d'un token
  const handleTokenSelect = (token) => {
    onTokenSelect(token.symbol);
    onClose();
  };

  // Gérer la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="token-selector-overlay" onClick={onClose}>
      <div className="token-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="token-selector-header">
          <h3>Sélectionner un token</h3>
          <button 
            className="token-selector-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <FiX />
          </button>
        </div>

        <div className="token-selector-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom, symbole ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>

        <div className="token-list">
          {filteredTokens.length === 0 ? (
            <div className="no-tokens">
              Aucun token trouvé pour "{searchTerm}"
            </div>
          ) : (
            filteredTokens.map((token) => (
              <div
                key={token.symbol}
                className={`token-item ${selectedToken === token.symbol ? 'selected' : ''}`}
                onClick={() => handleTokenSelect(token)}
              >
                <div className="token-info">
                  <img 
                    src={token.logo} 
                    alt={token.symbol}
                    className="token-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="token-details">
                    <div className="token-symbol">{token.symbol}</div>
                    <div className="token-name">{token.name}</div>
                  </div>
                </div>
                
                <div className="token-balance">
                  {userAddress && (
                    <>
                      {isLoadingBalances ? (
                        <div className="balance-loading">...</div>
                      ) : (
                        <div className="balance-amount">
                          {formatBalance(balances[token.symbol])}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {userAddress && (
          <div className="token-selector-footer">
            <small>Les soldes sont mis à jour en temps réel</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenSelector;
