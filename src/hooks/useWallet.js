import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getNetworkByChainId } from '../config/networks';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Vérifier si MetaMask est installé
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  // Connecter le wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask n\'est pas installé. Veuillez l\'installer pour continuer.');
      return false;
    }

    setIsConnecting(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('Aucun compte trouvé');
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      
      return true;
    } catch (err) {
      console.error('Erreur de connexion wallet:', err);
      if (err.code === 4001) {
        setError('Connexion refusée par l\'utilisateur');
      } else if (err.code === -32002) {
        setError('Demande de connexion déjà en cours');
      } else {
        setError(err.message || 'Erreur de connexion au wallet');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // Déconnecter le wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError('');
  }, []);

  // Changer de réseau
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) {
      setError('MetaMask n\'est pas disponible');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (err) {
      console.error('Erreur changement de réseau:', err);
      if (err.code === 4902) {
        setError('Ce réseau n\'est pas configuré dans MetaMask');
      } else {
        setError('Erreur lors du changement de réseau');
      }
      return false;
    }
  }, []);

  // Obtenir le solde d'un token
  const getTokenBalance = useCallback(async (tokenAddress, userAddress = account) => {
    if (!provider || !userAddress) return '0';

    try {
      if (!tokenAddress || tokenAddress === '') {
        // ETH natif
        const balance = await provider.getBalance(userAddress);
        return ethers.formatEther(balance);
      } else {
        // Token ERC20
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await tokenContract.balanceOf(userAddress);
        return balance.toString();
      }
    } catch (err) {
      console.error('Erreur récupération solde:', err);
      return '0';
    }
  }, [provider, account]);

  // Écouter les changements de compte et de réseau
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      // Recharger la page pour éviter les problèmes de state
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account, disconnectWallet]);

  // Vérifier la connexion au démarrage
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
        }
      } catch (err) {
        console.error('Erreur vérification connexion:', err);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled]);

  // Obtenir les informations du réseau actuel
  const currentNetwork = chainId ? getNetworkByChainId(chainId) : null;

  return {
    // État
    account,
    provider,
    signer,
    chainId,
    currentNetwork,
    isConnecting,
    error,
    isConnected: !!account,
    isMetaMaskInstalled: isMetaMaskInstalled(),

    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getTokenBalance,

    // Utilitaires
    formatAddress: (address) => {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  };
};
