import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { createUniswapService } from '../services/uniswapService';
import { getTokenBySymbol } from '../config/networks';

// ABI du SwapRouter
const SWAP_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)'
];

export const useSwap = (provider, signer, chainId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);

  // Créer le service Uniswap
  const uniswapService = provider && chainId ? createUniswapService(provider, chainId) : null;

  // Obtenir un devis pour un swap
  const getQuote = useCallback(async (fromTokenSymbol, toTokenSymbol, amount) => {
    if (!uniswapService || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setQuote(null);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fromToken = getTokenBySymbol(fromTokenSymbol, chainId);
      const toToken = getTokenBySymbol(toTokenSymbol, chainId);

      if (!fromToken || !toToken) {
        throw new Error('Token non trouvé');
      }

      // Convertir le montant en unités de base
      const amountIn = uniswapService.parseAmount(amount, fromToken.decimals);

      // Obtenir le meilleur devis
      const bestQuote = await uniswapService.getBestQuote(fromToken, toToken, amountIn);

      // Formater le montant de sortie
      const amountOut = uniswapService.formatAmount(bestQuote.amountOut, toToken.decimals);

      // Calculer le prix unitaire
      const price = Number(amountOut) / Number(amount);

      const quoteData = {
        amountIn: amount,
        amountOut,
        price,
        priceImpact: bestQuote.priceImpact,
        fee: bestQuote.fee,
        feeLabel: bestQuote.feeLabel,
        poolAddress: bestQuote.poolAddress,
        fromToken,
        toToken
      };

      setQuote(quoteData);
      
      // Estimer les frais de gas
      await estimateGas(quoteData);

    } catch (err) {
      console.error('Erreur obtention devis:', err);
      setError(err.message || 'Erreur lors de l\'obtention du devis');
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [uniswapService, chainId]);

  // Estimer les frais de gas
  const estimateGas = useCallback(async (quoteData) => {
    if (!signer || !uniswapService || !quoteData) return;

    try {
      const gasData = await uniswapService.estimateGasPrice();
      if (gasData) {
        setGasEstimate({
          gasPrice: gasData.gasPrice,
          maxFeePerGas: gasData.maxFeePerGas,
          maxPriorityFeePerGas: gasData.maxPriorityFeePerGas,
          estimatedCost: ethers.formatEther(gasData.gasPrice * 150000n) // Estimation approximative
        });
      }
    } catch (err) {
      console.error('Erreur estimation gas:', err);
    }
  }, [signer, uniswapService]);

  // Exécuter un swap
  const executeSwap = useCallback(async (quoteData, slippageTolerance = 0.5, deadline = 20) => {
    if (!signer || !uniswapService || !quoteData) {
      throw new Error('Configuration manquante pour le swap');
    }

    setIsLoading(true);
    setError('');

    try {
      const { fromToken, toToken, amountIn, amountOut, fee } = quoteData;
      const userAddress = await signer.getAddress();

      // Calculer le montant minimum avec slippage
      const slippageMultiplier = (100 - slippageTolerance) / 100;
      const amountOutMinimum = uniswapService.parseAmount(
        (Number(amountOut) * slippageMultiplier).toString(),
        toToken.decimals
      );

      // Calculer la deadline
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 60);

      // Vérifier et approuver le token si nécessaire
      if (!fromToken.isNative) {
        const allowance = await uniswapService.getTokenAllowance(
          fromToken.address,
          userAddress,
          uniswapService.network.router
        );

        const amountInBigInt = uniswapService.parseAmount(amountIn, fromToken.decimals);

        if (BigInt(allowance) < amountInBigInt) {
          console.log('Approbation du token nécessaire...');
          const approveTx = await uniswapService.approveToken(
            fromToken.address,
            uniswapService.network.router,
            amountInBigInt,
            signer
          );
          
          console.log('Transaction d\'approbation envoyée:', approveTx.hash);
          await approveTx.wait();
          console.log('Token approuvé avec succès');
        }
      }

      // Préparer les paramètres du swap
      const swapParams = {
        tokenIn: fromToken.address || ethers.ZeroAddress,
        tokenOut: toToken.address || ethers.ZeroAddress,
        fee: fee,
        recipient: userAddress,
        deadline: deadlineTimestamp,
        amountIn: uniswapService.parseAmount(amountIn, fromToken.decimals),
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0
      };

      // Créer le contrat du router
      const routerContract = new ethers.Contract(
        uniswapService.network.router,
        SWAP_ROUTER_ABI,
        signer
      );

      // Exécuter le swap
      const txOptions = {
        value: fromToken.isNative ? swapParams.amountIn : 0
      };

      console.log('Exécution du swap...', swapParams);
      const swapTx = await routerContract.exactInputSingle(swapParams, txOptions);
      
      console.log('Transaction de swap envoyée:', swapTx.hash);
      const receipt = await swapTx.wait();
      
      console.log('Swap exécuté avec succès:', receipt);
      
      return {
        hash: swapTx.hash,
        receipt,
        amountIn,
        amountOut,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol
      };

    } catch (err) {
      console.error('Erreur exécution swap:', err);
      const errorMessage = err.reason || err.message || 'Erreur lors du swap';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [signer, uniswapService]);

  // Obtenir le solde d'un token
  const getTokenBalance = useCallback(async (tokenSymbol, userAddress) => {
    if (!uniswapService || !userAddress) return '0';

    try {
      const token = getTokenBySymbol(tokenSymbol, chainId);
      if (!token) return '0';

      const balance = await uniswapService.getTokenBalance(token.address, userAddress);
      return uniswapService.formatAmount(balance, token.decimals);
    } catch (err) {
      console.error('Erreur récupération solde:', err);
      return '0';
    }
  }, [uniswapService, chainId]);

  // Nettoyer l'état quand le provider change
  useEffect(() => {
    setQuote(null);
    setGasEstimate(null);
    setError('');
  }, [provider, chainId]);

  return {
    // État
    isLoading,
    error,
    quote,
    gasEstimate,

    // Actions
    getQuote,
    executeSwap,
    getTokenBalance,

    // Utilitaires
    clearError: () => setError(''),
    clearQuote: () => setQuote(null)
  };
};
