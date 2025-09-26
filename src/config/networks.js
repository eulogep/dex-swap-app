// Configuration des réseaux et tokens supportés

export const NETWORKS = [
  {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: process.env.REACT_APP_ETHEREUM_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/8b8b0a5e9d2e4d8c9a4f6e8b0a5e9d2e',
    router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // SwapRouter02
    quoter: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3', // QuoterV2
    factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c', // UniswapV3Factory
    isTestnet: true,
    blockExplorer: 'https://sepolia.etherscan.io',
    tokens: [
      {
        symbol: 'ETH',
        address: '',
        decimals: 18,
        logo: require('../assets/ethereum-eth-logo.png'),
        isNative: true,
        name: 'Ethereum',
        coingeckoId: 'ethereum'
      },
      {
        symbol: 'USDC',
        address: '0x65aFADD39029741B3b8f0756952C74678c9cEC93', // Sepolia USDC
        decimals: 6,
        logo: require('../assets/usd-coin-usdc-logo.png'),
        isNative: false,
        name: 'USD Coin',
        coingeckoId: 'usd-coin'
      },
      {
        symbol: 'WETH',
        address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
        decimals: 18,
        logo: require('../assets/ethereum-eth-logo.png'),
        isNative: false,
        name: 'Wrapped Ethereum',
        coingeckoId: 'weth'
      },
      {
        symbol: 'DAI',
        address: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6', // Sepolia DAI
        decimals: 18,
        logo: require('../assets/dai-logo.png'),
        isNative: false,
        name: 'Dai Stablecoin',
        coingeckoId: 'dai'
      }
    ],
  },
  {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: process.env.REACT_APP_ETHEREUM_MAINNET_RPC || 'https://mainnet.infura.io/v3/8b8b0a5e9d2e4d8c9a4f6e8b0a5e9d2e',
    router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // SwapRouter02
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // QuoterV2
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // UniswapV3Factory
    isTestnet: false,
    blockExplorer: 'https://etherscan.io',
    tokens: [
      {
        symbol: 'ETH',
        address: '',
        decimals: 18,
        logo: require('../assets/ethereum-eth-logo.png'),
        isNative: true,
        name: 'Ethereum',
        coingeckoId: 'ethereum'
      },
      {
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        logo: require('../assets/usd-coin-usdc-logo.png'),
        isNative: false,
        name: 'USD Coin',
        coingeckoId: 'usd-coin'
      },
      {
        symbol: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        logo: require('../assets/ethereum-eth-logo.png'),
        isNative: false,
        name: 'Wrapped Ethereum',
        coingeckoId: 'weth'
      },
      {
        symbol: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        logo: require('../assets/dai-logo.png'),
        isNative: false,
        name: 'Dai Stablecoin',
        coingeckoId: 'dai'
      },
      {
        symbol: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        logo: require('../assets/wbtc-logo.png'),
        isNative: false,
        name: 'Wrapped BTC',
        coingeckoId: 'wrapped-bitcoin'
      },
      {
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        logo: require('../assets/usdt-logo.png'),
        isNative: false,
        name: 'Tether USD',
        coingeckoId: 'tether'
      },
      {
        symbol: 'LINK',
        address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        decimals: 18,
        logo: require('../assets/chainlink-link-logo.png'),
        isNative: false,
        name: 'Chainlink',
        coingeckoId: 'chainlink'
      },
      {
        symbol: 'UNI',
        address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        decimals: 18,
        logo: require('../assets/uniswap-uni-logo.png'),
        isNative: false,
        name: 'Uniswap',
        coingeckoId: 'uniswap'
      }
    ],
  },
];

// Frais de pool Uniswap v3 disponibles
export const POOL_FEES = [
  { fee: 100, label: '0.01%' },   // Stablecoins
  { fee: 500, label: '0.05%' },   // Standard
  { fee: 3000, label: '0.3%' },   // Standard
  { fee: 10000, label: '1%' }     // Exotic pairs
];

// Configuration par défaut
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const DEFAULT_DEADLINE = 20; // 20 minutes
export const MAX_SLIPPAGE = 50; // 50%

// Utilitaires
export const getNetworkByChainId = (chainId) => {
  return NETWORKS.find(network => network.chainId === chainId);
};

export const getTokenByAddress = (address, chainId) => {
  const network = getNetworkByChainId(chainId);
  if (!network) return null;
  
  return network.tokens.find(token => 
    token.address.toLowerCase() === address.toLowerCase() ||
    (token.isNative && address === '')
  );
};

export const getTokenBySymbol = (symbol, chainId) => {
  const network = getNetworkByChainId(chainId);
  if (!network) return null;
  
  return network.tokens.find(token => 
    token.symbol.toLowerCase() === symbol.toLowerCase()
  );
};
