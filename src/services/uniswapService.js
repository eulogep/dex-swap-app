import { ethers } from 'ethers';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { Pool, Route, Trade, SwapRouter, SwapQuoter } from '@uniswap/v3-sdk';
import { getNetworkByChainId, POOL_FEES } from '../config/networks';

// ABI pour les contrats Uniswap
const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
];

const POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function fee() external view returns (uint24)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)'
];

const FACTORY_ABI = [
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'
];

const ERC20_ABI = [
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
];

class UniswapService {
  constructor(provider, chainId) {
    this.provider = provider;
    this.chainId = chainId;
    this.network = getNetworkByChainId(chainId);
    
    if (!this.network) {
      throw new Error(`Réseau non supporté: ${chainId}`);
    }

    this.quoterContract = new ethers.Contract(
      this.network.quoter,
      QUOTER_ABI,
      provider
    );

    this.factoryContract = new ethers.Contract(
      this.network.factory,
      FACTORY_ABI,
      provider
    );
  }

  // Créer un objet Token SDK
  createToken(tokenConfig) {
    return new Token(
      this.chainId,
      tokenConfig.address || ethers.ZeroAddress,
      tokenConfig.decimals,
      tokenConfig.symbol,
      tokenConfig.name
    );
  }

  // Obtenir l'adresse du pool pour une paire de tokens
  async getPoolAddress(tokenA, tokenB, fee) {
    try {
      const poolAddress = await this.factoryContract.getPool(
        tokenA.address || ethers.ZeroAddress,
        tokenB.address || ethers.ZeroAddress,
        fee
      );
      
      if (poolAddress === ethers.ZeroAddress) {
        return null;
      }
      
      return poolAddress;
    } catch (error) {
      console.error('Erreur récupération adresse pool:', error);
      return null;
    }
  }

  // Obtenir les informations d'un pool
  async getPoolInfo(poolAddress) {
    try {
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, this.provider);
      
      const [slot0, liquidity, fee, token0, token1] = await Promise.all([
        poolContract.slot0(),
        poolContract.liquidity(),
        poolContract.fee(),
        poolContract.token0(),
        poolContract.token1()
      ]);

      return {
        sqrtPriceX96: slot0.sqrtPriceX96,
        tick: slot0.tick,
        liquidity,
        fee,
        token0,
        token1
      };
    } catch (error) {
      console.error('Erreur récupération info pool:', error);
      return null;
    }
  }

  // Obtenir le meilleur prix pour un swap
  async getBestQuote(tokenIn, tokenOut, amountIn) {
    const quotes = [];

    // Tester différents frais de pool
    for (const poolFee of POOL_FEES) {
      try {
        const poolAddress = await this.getPoolAddress(tokenIn, tokenOut, poolFee.fee);
        
        if (!poolAddress) continue;

        // Utiliser le quoter pour obtenir le prix
        const amountOut = await this.quoterContract.quoteExactInputSingle(
          tokenIn.address || ethers.ZeroAddress,
          tokenOut.address || ethers.ZeroAddress,
          poolFee.fee,
          amountIn,
          0 // sqrtPriceLimitX96 = 0 (pas de limite)
        );

        quotes.push({
          fee: poolFee.fee,
          feeLabel: poolFee.label,
          amountOut: amountOut.toString(),
          poolAddress,
          priceImpact: await this.calculatePriceImpact(poolAddress, amountIn, amountOut)
        });

      } catch (error) {
        console.error(`Erreur quote pour fee ${poolFee.fee}:`, error);
        continue;
      }
    }

    if (quotes.length === 0) {
      throw new Error('Aucun pool disponible pour cette paire');
    }

    // Retourner le meilleur quote (plus d'amountOut)
    return quotes.reduce((best, current) => 
      BigInt(current.amountOut) > BigInt(best.amountOut) ? current : best
    );
  }

  // Calculer l'impact sur le prix
  async calculatePriceImpact(poolAddress, amountIn, amountOut) {
    try {
      const poolInfo = await this.getPoolInfo(poolAddress);
      if (!poolInfo) return 0;

      // Calcul simplifié de l'impact sur le prix
      // Dans une implémentation complète, il faudrait utiliser les formules Uniswap v3
      const liquidity = BigInt(poolInfo.liquidity);
      const impact = (BigInt(amountIn) * 10000n) / liquidity;
      
      return Number(impact) / 100; // Convertir en pourcentage
    } catch (error) {
      console.error('Erreur calcul price impact:', error);
      return 0;
    }
  }

  // Obtenir le solde d'un token
  async getTokenBalance(tokenAddress, userAddress) {
    try {
      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        // ETH natif
        const balance = await this.provider.getBalance(userAddress);
        return balance.toString();
      } else {
        // Token ERC20
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await tokenContract.balanceOf(userAddress);
        return balance.toString();
      }
    } catch (error) {
      console.error('Erreur récupération solde:', error);
      return '0';
    }
  }

  // Vérifier l'allowance d'un token
  async getTokenAllowance(tokenAddress, userAddress, spenderAddress) {
    try {
      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        return ethers.MaxUint256.toString(); // ETH natif n'a pas besoin d'allowance
      }

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const allowance = await tokenContract.allowance(userAddress, spenderAddress);
      return allowance.toString();
    } catch (error) {
      console.error('Erreur récupération allowance:', error);
      return '0';
    }
  }

  // Approuver un token
  async approveToken(tokenAddress, spenderAddress, amount, signer) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await tokenContract.approve(spenderAddress, amount);
      return tx;
    } catch (error) {
      console.error('Erreur approbation token:', error);
      throw error;
    }
  }

  // Estimer les frais de gas
  async estimateGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      return {
        gasPrice: feeData.gasPrice,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
      };
    } catch (error) {
      console.error('Erreur estimation gas:', error);
      return null;
    }
  }

  // Formater un montant avec les décimales appropriées
  formatAmount(amount, decimals) {
    return ethers.formatUnits(amount, decimals);
  }

  // Parser un montant avec les décimales appropriées
  parseAmount(amount, decimals) {
    return ethers.parseUnits(amount.toString(), decimals);
  }
}

// Fonction utilitaire pour créer une instance du service
export const createUniswapService = (provider, chainId) => {
  return new UniswapService(provider, chainId);
};

export default UniswapService;
