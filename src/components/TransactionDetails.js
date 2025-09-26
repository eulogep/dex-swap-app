import React from 'react';
import { FiExternalLink, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import './TransactionDetails.css';

const TransactionDetails = ({ 
  quote, 
  gasEstimate, 
  slippage, 
  network,
  onSlippageChange 
}) => {
  if (!quote) return null;

  const { amountIn, amountOut, price, priceImpact, feeLabel, fromToken, toToken } = quote;

  // Calculer le montant minimum reçu avec slippage
  const minReceived = (Number(amountOut) * (100 - slippage) / 100).toFixed(6);

  // Déterminer la couleur selon l'impact sur le prix
  const getPriceImpactColor = (impact) => {
    if (impact < 0.1) return '#10b981'; // Vert
    if (impact < 1) return '#f59e0b';   // Orange
    return '#ef4444';                   // Rouge
  };

  // Formater les frais de gas
  const formatGasCost = (cost) => {
    if (!cost) return '--';
    const num = parseFloat(cost);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  return (
    <div className="transaction-details">
      <div className="details-header">
        <FiInfo className="details-icon" />
        <h3>Détails de la transaction</h3>
      </div>

      <div className="details-grid">
        {/* Montants */}
        <div className="detail-row">
          <span className="detail-label">Vous payez</span>
          <div className="detail-value">
            <img src={fromToken.logo} alt={fromToken.symbol} className="token-icon-small" />
            <span>{amountIn} {fromToken.symbol}</span>
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Vous recevez (estimé)</span>
          <div className="detail-value">
            <img src={toToken.logo} alt={toToken.symbol} className="token-icon-small" />
            <span>{Number(amountOut).toFixed(6)} {toToken.symbol}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="detail-row">
          <span className="detail-label">Prix unitaire</span>
          <span className="detail-value">
            1 {fromToken.symbol} = {price.toFixed(6)} {toToken.symbol}
          </span>
        </div>

        {/* Slippage */}
        <div className="detail-row">
          <span className="detail-label">
            Slippage toléré
            <button 
              className="info-tooltip"
              title="Différence maximale acceptable entre le prix attendu et le prix d'exécution"
            >
              <FiInfo size={12} />
            </button>
          </span>
          <div className="slippage-controls">
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={slippage}
              onChange={(e) => onSlippageChange(parseFloat(e.target.value))}
              className="slippage-input"
            />
            <span>%</span>
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Montant minimum reçu</span>
          <div className="detail-value">
            <img src={toToken.logo} alt={toToken.symbol} className="token-icon-small" />
            <span>{minReceived} {toToken.symbol}</span>
          </div>
        </div>

        {/* Impact sur le prix */}
        <div className="detail-row">
          <span className="detail-label">
            Impact sur le prix
            <button 
              className="info-tooltip"
              title="Effet de votre transaction sur le prix du marché"
            >
              <FiInfo size={12} />
            </button>
          </span>
          <span 
            className="detail-value price-impact"
            style={{ color: getPriceImpactColor(priceImpact) }}
          >
            {priceImpact < 0.01 ? '< 0.01%' : `${priceImpact.toFixed(2)}%`}
          </span>
        </div>

        {/* Frais */}
        <div className="detail-row">
          <span className="detail-label">Frais de pool Uniswap</span>
          <span className="detail-value">{feeLabel}</span>
        </div>

        {gasEstimate && (
          <div className="detail-row">
            <span className="detail-label">
              Frais de gas (estimé)
              <button 
                className="info-tooltip"
                title="Frais payés aux mineurs pour traiter la transaction"
              >
                <FiInfo size={12} />
              </button>
            </span>
            <span className="detail-value">
              ~{formatGasCost(gasEstimate.estimatedCost)} ETH
            </span>
          </div>
        )}

        {/* Réseau */}
        <div className="detail-row">
          <span className="detail-label">Réseau</span>
          <div className="detail-value network-info">
            <span>{network.name}</span>
            {network.isTestnet && (
              <span className="testnet-badge">Testnet</span>
            )}
          </div>
        </div>
      </div>

      {/* Avertissements */}
      {priceImpact > 1 && (
        <div className="warning-box">
          <FiAlertTriangle className="warning-icon" />
          <div>
            <strong>Impact élevé sur le prix ({priceImpact.toFixed(2)}%)</strong>
            <p>Cette transaction aura un impact significatif sur le prix du marché.</p>
          </div>
        </div>
      )}

      {slippage > 5 && (
        <div className="warning-box">
          <FiAlertTriangle className="warning-icon" />
          <div>
            <strong>Slippage élevé ({slippage}%)</strong>
            <p>Vous pourriez recevoir beaucoup moins que prévu.</p>
          </div>
        </div>
      )}

      {/* Lien vers l'explorateur */}
      <div className="explorer-link">
        <a 
          href={network.blockExplorer}
          target="_blank"
          rel="noopener noreferrer"
          className="link-button"
        >
          Voir sur {network.blockExplorer.includes('etherscan') ? 'Etherscan' : 'Block Explorer'}
          <FiExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default TransactionDetails;
