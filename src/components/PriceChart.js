import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Simulation de données de prix (à remplacer par une vraie API)
const generateMockPriceData = (symbol, timeframe = '24h') => {
  const basePrice = {
    'ETH': 2000,
    'BTC': 45000,
    'USDC': 1,
    'DAI': 1,
    'LINK': 15,
    'UNI': 8,
  }[symbol] || 100;

  const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
  const data = [];
  let currentPrice = basePrice;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 0.1; // ±5% max change
    currentPrice = currentPrice * (1 + change);
    
    const timestamp = new Date();
    if (timeframe === '24h') {
      timestamp.setHours(timestamp.getHours() - (points - i));
    } else if (timeframe === '7d') {
      timestamp.setDate(timestamp.getDate() - (points - i));
    } else {
      timestamp.setDate(timestamp.getDate() - (points - i));
    }

    data.push({
      timestamp: timestamp.toISOString(),
      price: currentPrice,
      volume: Math.random() * 1000000,
    });
  }

  return data;
};

const PriceChart = ({ 
  tokenSymbol, 
  className = '',
  showControls = true,
  height = 200,
  compact = false 
}) => {
  const [timeframe, setTimeframe] = useState('24h');
  const [priceData, setPriceData] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Charger les données de prix
  useEffect(() => {
    const data = generateMockPriceData(tokenSymbol, timeframe);
    setPriceData(data);
  }, [tokenSymbol, timeframe]);

  // Dessiner le graphique
  useEffect(() => {
    if (!priceData.length || !canvasRef.current || !isVisible) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Ajuster la résolution pour les écrans haute densité
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = compact ? 10 : 20;

    // Calculer les valeurs min/max
    const prices = priceData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Fonction pour convertir les coordonnées
    const getX = (index) => padding + (index / (priceData.length - 1)) * (width - 2 * padding);
    const getY = (price) => padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner la grille (si pas compact)
    if (!compact) {
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
      ctx.lineWidth = 1;
      
      // Lignes horizontales
      for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * (height - 2 * padding);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      
      // Lignes verticales
      for (let i = 0; i <= 4; i++) {
        const x = padding + (i / 4) * (width - 2 * padding);
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
    }

    // Créer le gradient pour la zone sous la courbe
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    const isPositive = prices[prices.length - 1] > prices[0];
    
    if (isPositive) {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    }

    // Dessiner la zone sous la courbe
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(getX(0), height - padding);
    
    priceData.forEach((point, index) => {
      ctx.lineTo(getX(index), getY(point.price));
    });
    
    ctx.lineTo(getX(priceData.length - 1), height - padding);
    ctx.closePath();
    ctx.fill();

    // Dessiner la ligne de prix
    ctx.strokeStyle = isPositive ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    priceData.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.price);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Dessiner les points (si pas compact)
    if (!compact) {
      ctx.fillStyle = isPositive ? '#22c55e' : '#ef4444';
      priceData.forEach((point, index) => {
        const x = getX(index);
        const y = getY(point.price);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Point survolé
    if (hoveredPoint !== null && hoveredPoint < priceData.length) {
      const x = getX(hoveredPoint);
      const y = getY(priceData[hoveredPoint].price);
      
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [priceData, isVisible, hoveredPoint, compact]);

  // Gestion du survol
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !priceData.length) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = compact ? 10 : 20;
    const chartWidth = rect.width - 2 * padding;
    
    const pointIndex = Math.round(((x - padding) / chartWidth) * (priceData.length - 1));
    
    if (pointIndex >= 0 && pointIndex < priceData.length) {
      setHoveredPoint(pointIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Calculer les statistiques
  const currentPrice = priceData[priceData.length - 1]?.price || 0;
  const previousPrice = priceData[0]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  const formatPrice = (price) => {
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(Math.abs(change))} (${sign}${percent.toFixed(2)}%)`;
  };

  const timeframes = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7J' },
    { key: '30d', label: '30J' },
  ];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      {showControls && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Prix {tokenSymbol}
              </h3>
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {isVisible ? (
                  <EyeIcon className="w-4 h-4" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {timeframes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeframe(key)}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium transition-colors
                    ${timeframe === key
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Prix et changement */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${formatPrice(currentPrice)}
              </div>
              <div className={`flex items-center text-sm ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                {formatChange(priceChange, priceChangePercent)}
              </div>
            </div>
            
            {hoveredPoint !== null && (
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(priceData[hoveredPoint].timestamp).toLocaleString('fr-FR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${formatPrice(priceData[hoveredPoint].price)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Graphique */}
      <div className={`relative ${compact ? 'p-2' : 'p-4'}`}>
        <canvas
          ref={canvasRef}
          width={400}
          height={height}
          className="w-full cursor-crosshair"
          style={{ height: `${height}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {!isVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <EyeSlashIcon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Graphique masqué</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer compact */}
      {compact && (
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              {timeframe}
            </span>
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PriceChart;
