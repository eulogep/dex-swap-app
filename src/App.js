// import React from 'react';

import './App.css';

import React, { useState, useEffect } from 'react';
import Tabs from './components/Tabs';
import './components/Tabs.css';
import { ethers } from 'ethers';

// --- CONFIG MULTI-CHAINS & TOKENS ---
const NETWORKS = [
  {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/8b8b0a5e9d2e4d8c9a4f6e8b0a5e9d2e',
    router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    tokens: [
      {
        symbol: 'ETH',
        address: '',
        decimals: 18,
        logo: require('./assets/ethereum-eth-logo.png'),
        isNative: true,
        name: 'Ethereum',
      },
      {
        symbol: 'USDC',
        address: '0x65aFADD39029741B3b8f0756952C74678c9cEC93',
        decimals: 6,
        logo: require('./assets/usd-coin-usdc-logo.png'),
        isNative: false,
        name: 'USD Coin',
      },
      {
        symbol: 'DAI',
        address: '0xBCb5bD3A5661bF0bA5c2c818fFfC3843cB8b8B8b', // fictif Sepolia
        decimals: 18,
        logo: require('./assets/dai-logo.png'),
        isNative: false,
        name: 'Dai Stablecoin',
      },
      {
        symbol: 'WBTC',
        address: '0xB2A7bA3aB5b2C8a8bA5b2C8a8bA5b2C8a8bA5b2C', // fictif Sepolia
        decimals: 8,
        logo: require('./assets/wbtc-logo.png'),
        isNative: false,
        name: 'Wrapped BTC',
      },
      {
        symbol: 'USDT',
        address: '0xD9b8b8B8b8B8b8B8b8B8b8B8b8B8b8B8b8B8b8B8', // fictif Sepolia
        decimals: 6,
        logo: require('./assets/usdt-logo.png'),
        isNative: false,
        name: 'Tether USD',
      },
    ],
  },
  {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/8b8b0a5e9d2e4d8c9a4f6e8b0a5e9d2e',
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    tokens: [
      {
        symbol: 'ETH',
        address: '',
        decimals: 18,
        logo: require('./assets/ethereum-eth-logo.png'),
        isNative: true,
        name: 'Ethereum',
      },
      {
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        logo: require('./assets/usd-coin-usdc-logo.png'),
        isNative: false,
        name: 'USD Coin',
      },
      {
        symbol: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        logo: require('./assets/dai-logo.png'),
        isNative: false,
        name: 'Dai Stablecoin',
      },
      {
        symbol: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        logo: require('./assets/wbtc-logo.png'),
        isNative: false,
        name: 'Wrapped BTC',
      },
      {
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        logo: require('./assets/usdt-logo.png'),
        isNative: false,
        name: 'Tether USD',
      },
    ],
  },
];
// Par défaut Sepolia
function App() {
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    if (showIntro) {
      // Explication vocale (Web Speech API)
      const synth = window.speechSynthesis;
      const utter = new window.SpeechSynthesisUtterance(
        "Bienvenue sur DEX Swap App. Cette application a ete realiser par Euloge Mabiala et vous permet d'échanger des cryptomonnaies instantanément, sans intermédiaire, en toute sécurité, sur plusieurs réseaux. Connectez votre portefeuille pour commencer."
      );
      utter.lang = 'fr-FR';
      utter.rate = 1;
      synth.cancel();
      synth.speak(utter);
      return () => {
        synth.cancel();
      };
    }
  }, [showIntro]);
  const [networkIdx, setNetworkIdx] = useState(0);
  const network = NETWORKS[networkIdx];
  const TOKENS = network.tokens;
  const UNISWAP_ROUTER = network.router;
  const RPC_URL = network.rpcUrl;

  const [swapHistory, setSwapHistory] = useState([]);
  const [lightMode, setLightMode] = useState(() => {
    try {
      const saved = localStorage.getItem('lightMode');
      return saved ? saved === 'true' : false;
    } catch (e) {
      return false;
    }
  });
  useEffect(() => {
    document.body.classList.toggle('light-mode', lightMode);
    try { localStorage.setItem('lightMode', String(lightMode)); } catch (e) {}
  }, [lightMode]);
  const [toast, setToast] = useState({ show: false, message: '', status: '' });
  // Fermer le toast après 3s
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');

  // Uniswap integration state
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(null);
  const [slippage, setSlippage] = useState(0.5); // %
  const [minReceived, setMinReceived] = useState(null);
  const [simulateMsg, setSimulateMsg] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // ETH and USDC token data for Sepolia testnet
  // (déjà définis en haut)


  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
        setError('');
      } catch (err) {
        setError('Wallet connection refused.');
      }
    } else {
      setError('MetaMask is not installed.');
    }
  };

  // Fetch price simulation when amount/from/to changes
  React.useEffect(() => {
    const fetchPrice = async () => {
      setPrice(null);
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
      try {
        // Recherche des adresses des tokens sélectionnés
        const tokenIn = TOKENS.find(t => t.symbol === fromToken);
        const tokenOut = TOKENS.find(t => t.symbol === toToken);
        if (!tokenIn || !tokenOut) return setPrice('--');

        // Ici, il faudrait idéalement rechercher dynamiquement le pool Uniswap v3 correspondant (tokenIn/tokenOut, fee tier 0.3%)
        // Pour la démo, on affiche "Simulation non supportée" si ce n'est pas ETH/USDC sur Sepolia/Mainnet
        // (À remplacer plus tard par une vraie recherche de pool via Uniswap SDK ou sous-graph)
        if (
          (tokenIn.symbol === 'ETH' && tokenOut.symbol === 'USDC') ||
          (tokenIn.symbol === 'USDC' && tokenOut.symbol === 'ETH')
        ) {
          // Adresse du pool à utiliser selon le réseau
          const poolAddress = network.name.includes('Sepolia')
            ? '0x7c6B471A0b0eA2bD9c7eC7aB6E4a2a8E2A5e2A5e' // Remplacer par le vrai pool ETH/USDC sur Sepolia
            : '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'; // Pool ETH/USDC Mainnet
          const provider = new ethers.JsonRpcProvider(RPC_URL);
          const poolABI = [
            'function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)',
            'function liquidity() external view returns (uint128)'
          ];
          const poolContract = new ethers.Contract(poolAddress, poolABI, provider);
          const slot0 = await poolContract.slot0();
          const sqrtPriceX96 = slot0[0];
          const priceETH_USDC = Number(sqrtPriceX96) / 2 ** 96;
          const priceFinal = priceETH_USDC ** 2;
          if (tokenIn.symbol === 'ETH') {
            setPrice((Number(amount) * priceFinal).toFixed(2));
          } else {
            setPrice((Number(amount) / priceFinal).toFixed(6));
          }
        } else {
          setPrice('--');
        }
      } catch (e) {
        setPrice('--');
      }
    };
    fetchPrice();
    // eslint-disable-next-line
  }, [amount, fromToken, toToken]);

  const [tab, setTab] = useState('swap');

  return (
    <div className="App">
      {showIntro && (
        <div className="intro-overlay" onClick={() => setShowIntro(false)}>
          <div className="intro-card">
            <div className="intro-logo">
              <span className="crypto-coin">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#61dafb" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#61dafb" stopOpacity="0"/>
                    </radialGradient>
                    <linearGradient id="coin" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffe066"/>
                      <stop offset="100%" stopColor="#61dafb"/>
                    </linearGradient>
                  </defs>
                  <circle cx="32" cy="32" r="28" fill="url(#coin)" stroke="#fff" strokeWidth="2" filter="url(#glow)"/>
                  <circle cx="32" cy="32" r="32" fill="url(#halo)"/>
                  <text x="32" y="41" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#232526" filter="url(#shadow)">Ξ</text>
                </svg>
              </span>
            </div>
            <h2 className="intro-title">Bienvenue sur <span className="intro-title-accent">DEX Swap App</span></h2>
            <p className="intro-desc">
              Échangez vos cryptomonnaies instantanément, sans intermédiaire, sur plusieurs réseaux Ethereum.<br/>
              <b>Sécurité, rapidité, liberté.</b><br/>
              Cliquez sur "Commencer".
            </p>
            <button className="intro-btn" onClick={e => {e.stopPropagation(); setShowIntro(false);}}>Commencer</button>
          </div>
        </div>
      )}
      <header className="App-header">
        <button
          className={("toggle-mode-btn" + (lightMode ? " active" : "")) + " toggle-mode-fixed"}
          aria-label={lightMode ? "Basculer en mode sombre" : "Basculer en mode clair"}
          aria-pressed={lightMode}
          onClick={() => setLightMode(m => !m)}
        >
          {lightMode ? '🌞' : '🌙'}
        </button>
         <h1 className="swap-title">DEX Swap App <span className="testnet-badge">{network.name}</span></h1>
         <div className="swap-card">
           {/* Sélection du réseau */}
           <div className="swap-field">
  <select
    id="network-select"
    className="swap-select"
    value={networkIdx}
    onChange={e => setNetworkIdx(Number(e.target.value))}
    aria-label="Sélection du réseau"
    tabIndex={0}
    required
    
  >
    {NETWORKS.map((net, idx) => (
      <option key={net.chainId} value={idx}>{net.name}</option>
    ))}
  </select>
  <label className="swap-label" htmlFor="network-select">Réseau</label>
</div>
           {account ? (
             <>
               <div className="wallet-info">
                 <span className="wallet-label">Wallet connecté :</span>
                 <span className="wallet-address">{account}</span>
               </div>
               <form className="swap-form" onSubmit={e => e.preventDefault()} aria-label="Formulaire de swap" tabIndex={0}>
                 <div className="swap-field">
  <div className="swap-token-select">
    {TOKENS.find(t => t.symbol === fromToken) && (
      <img src={TOKENS.find(t => t.symbol === fromToken).logo} alt={fromToken} className="token-icon" />
    )}
    <select
      id="from-token-select"
      className="swap-select"
      value={fromToken}
      onChange={e => {
        setFromToken(e.target.value);
        if (e.target.value === toToken) {
          const firstOther = TOKENS.find(t => t.symbol !== e.target.value);
          setToToken(firstOther.symbol);
        }
      }}
      aria-label="Sélection du token source"
      tabIndex={0}
      required
      
    >
      {TOKENS.map(t => (
        <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
      ))}
    </select>
    <label className="swap-label" htmlFor="from-token-select">From</label>
  </div>
</div>
                 <div className="swap-field">
  <div className="swap-token-select">
    {TOKENS.find(t => t.symbol === toToken) && (
      <img src={TOKENS.find(t => t.symbol === toToken).logo} alt={toToken} className="token-icon" />
    )}
    <select
      id="to-token-select"
      className="swap-select"
      value={toToken}
      onChange={e => {
        setToToken(e.target.value);
        if (e.target.value === fromToken) {
          const firstOther = TOKENS.find(t => t.symbol !== e.target.value);
          setFromToken(firstOther.symbol);
        }
      }}
      aria-label="Sélection du token destination"
      tabIndex={0}
      required
      
    >
      {TOKENS.filter(t => t.symbol !== fromToken).map(t => (
        <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
      ))}
    </select>
    <label className="swap-label" htmlFor="to-token-select">To</label>
  </div>
</div>
                <div className="swap-field">
  <input
    id="amount-input"
    type="number"
    min="0"
    step="any"
    placeholder=" "
    value={amount}
    onChange={e => setAmount(e.target.value)}
    className="swap-input"
    aria-label="Montant à échanger"
    tabIndex={0}
    required
    
  />
  <label className="swap-label" htmlFor="amount-input">Montant</label>
</div>
                <div className="swap-field">
  <input
    id="slippage-input"
    type="number"
    min="0"
    max="5"
    step="0.1"
    placeholder=" "
    value={slippage}
    onChange={e => setSlippage(e.target.value)}
    className="swap-input"
    aria-label="Slippage toléré (%)"
    tabIndex={0}
    required
    
  />
  <label className="swap-label" htmlFor="slippage-input">Slippage (%)</label>
</div>
                <div className="swap-summary">
                  <div className="swap-summary-row">Prix estimé : <span className="swap-summary-value">{price !== null ? price : <span className="placeholder-dash">--</span>} {toToken}</span></div>
                  <div className="swap-summary-row">Frais Uniswap : <span className="swap-summary-value">0.3%</span></div>
                  {simulateMsg && (
                    <div className="swap-summary-row swap-simulate-msg">{simulateMsg}</div>
                  )}
                  {/* Résumé transaction avant swap */}
                  {simulateMsg && amount && (
                    <div className="tx-summary-card">
                      <div className="tx-summary-title">Résumé de la transaction</div>
                      <div className="tx-summary-line"><span>De :</span> <span>{amount} <img src={TOKENS.find(t => t.symbol === fromToken)?.logo} alt={fromToken} className="token-icon" /> {fromToken}</span></div>
                      <div className="tx-summary-line"><span>Vers :</span> <span><img src={TOKENS.find(t => t.symbol === toToken)?.logo} alt={toToken} className="token-icon" /> {toToken}</span></div>
                      <div className="tx-summary-line"><span>Prix estimé :</span> <span>{price} {toToken}</span></div>
                      <div className="tx-summary-line"><span>Slippage toléré :</span> <span>{slippage}%</span></div>
                      <div className="tx-summary-line"><span>Montant minimum reçu :</span> <span>{minReceived} {toToken}</span></div>
                    </div>
                  )}
                  {txStatus && (
                    <div className={txStatus.startsWith('✅') ? 'swap-status-success' : 'swap-status-error'}>{txStatus}</div>
                  )}
                </div>
                <div className="swap-actions">
                  <button
                    className="swap-btn simulate-btn"
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      setSimulateMsg('');
                      try {
                        if (price && !isNaN(Number(price))) {
                          const slippageFactor = 1 - Number(slippage) / 100;
                          const min = (Number(price) * slippageFactor).toFixed(6);
                          setMinReceived(min);
                          setSimulateMsg(`Vous recevrez au minimum : ${min} ${toToken}`);
                        } else {
                          setSimulateMsg('Simulation impossible.');
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || !amount || !price || price === '--' || isNaN(Number(price))}
                  >
                    {loading ? <span className="loader"></span> : 'Simuler swap'}
                  </button>
                  <button
                    className="swap-btn swap-btn-main"
                    type="button"
                    disabled={loading ||
                      !account ||
                      !amount ||
                      !price ||
                      price === '--' ||
                      isNaN(Number(price))}
                    onClick={async () => {
                      setLoading(true);
                      setTxStatus('');
                      try {
                        if (!window.ethereum) throw new Error('MetaMask requis');
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await provider.getSigner();
                        const tokenIn = TOKENS.find(t => t.symbol === fromToken);
                        const tokenOut = TOKENS.find(t => t.symbol === toToken);
                        if (!tokenIn || !tokenOut) throw new Error('Token sélectionné introuvable');
                        const router = UNISWAP_ROUTER;
                        const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
                        let amountIn, minOut;
                        if (tokenIn.isNative) {
                          amountIn = ethers.parseUnits(amount, tokenIn.decimals);
                        } else {
                          amountIn = ethers.parseUnits(amount, tokenIn.decimals);
                        }
                        minOut = ethers.parseUnits(
                          (Number(price) * (1 - Number(slippage) / 100)).toFixed(tokenOut.decimals),
                          tokenOut.decimals
                        );
                        // Pour la démo : swap exactInputSingle (Uniswap v3)
                        // Il faudrait gérer les approvals ERC20 si tokenIn n'est pas natif
                        const iface = new ethers.Interface([
                          'function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) payable returns (uint256)'
                        ]);
                        const params = {
                          tokenIn: tokenIn.isNative ? '0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2' : tokenIn.address, // WETH9 si natif
                          tokenOut: tokenOut.address,
                          fee: 3000,
                          recipient: account,
                          deadline,
                          amountIn,
                          amountOutMinimum: minOut,
                          sqrtPriceLimitX96: 0n
                        };
                        const tx = await signer.sendTransaction({
                          to: router,
                          value: tokenIn.isNative ? amountIn : 0n,
                          data: iface.encodeFunctionData('exactInputSingle', [params])
                        });
                        setTxStatus('Transaction envoyée. Attente de confirmation...');
                        await tx.wait();
                        setTxStatus('✅ Swap effectué avec succès !');
                        setToast({ show: true, message: 'Swap effectué avec succès !', status: 'success' });
                        setSwapHistory(prev => [
                          {
                            date: new Date().toLocaleString(),
                            amount,
                            fromToken,
                            toToken,
                            minReceived,
                          },
                          ...prev
                        ]);
                      } catch (e) {
                        setTxStatus('❌ Erreur : ' + (e.reason || e.message || e.toString()));
                        setToast({ show: true, message: 'Erreur : ' + (e.reason || e.message || e.toString()), status: 'error' });
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? <span className="loader"></span> : 'Swap ETH → USDC'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <button className="swap-btn connect-btn" onClick={connectWallet}>Connect MetaMask</button>
          )}
          {error && <div className="swap-status-error">{error}</div>}
        </div>
      </header>
      {/* Onglets de navigation */}
      {!showIntro && (
        <Tabs
          tabs={[
            { key: 'swap', label: 'Swap', icon: <span role="img" aria-label="swap">🔄</span> },
            { key: 'help', label: 'Aide', icon: <span role="img" aria-label="aide">❓</span> },
            { key: 'info', label: 'Infos', icon: <span role="img" aria-label="infos">ℹ️</span> },
          ]}
          current={tab}
          onChange={setTab}
        />
      )}

      {/* Contenu selon l’onglet */}
      {tab === 'swap' && (
        <>
          <header className="App-header">
            {/* ... swap UI inchangée ... */}
            {/* Historique des swaps */}
            {swapHistory.length > 0 && (
              <div className="swap-history-card">
                <div className="swap-history-title">Historique des swaps</div>
                {swapHistory.map((h, i) => (
                  <div key={i} className="swap-history-item">
                    <span>{h.amount} <img src={TOKENS.find(t => t.symbol === h.fromToken)?.logo} alt={h.fromToken} className="token-icon" /> {h.fromToken} → <img src={TOKENS.find(t => t.symbol === h.toToken)?.logo} alt={h.toToken} className="token-icon" /> {h.toToken}</span>
                    <span className="swap-history-time">{h.date}</span>
                  </div>
                ))}
              </div>
            )}
          </header>
        </>
      )}
      {tab === 'help' && (
        <div className="swap-card content-card-narrow">
          <h2 className="help-title">Aide & FAQ</h2>
          <ul className="section-list">
            <li><b>Comment connecter mon wallet&nbsp;?</b><br/>Clique sur “Connect MetaMask” sur l’onglet Swap. Installe MetaMask si besoin.</li>
            <li><b>Comment choisir le réseau&nbsp;?</b><br/>Utilise le menu déroulant en haut de l’onglet Swap pour passer de Sepolia à Mainnet.</li>
            <li><b>Comment fonctionne le swap&nbsp;?</b><br/>Sélectionne les tokens, entre le montant, simule puis valide. La transaction se signe dans le wallet.</li>
            <li><b>Pourquoi certains swaps ne fonctionnent pas&nbsp;?</b><br/>La démo supporte surtout ETH⇄USDC sur Sepolia/Mainnet. Les autres couples sont à venir.</li>
            <li><b>Où voir l’historique&nbsp;?</b><br/>L’historique s’affiche sous le formulaire Swap après chaque échange réussi.</li>
          </ul>
          <div className="support-note">Besoin d’aide&nbsp;? Contacte le développeur sur GitHub&nbsp;: <a href="https://github.com/eulogep" target="_blank" rel="noopener noreferrer" className="link-accent">eulogep</a></div>
        </div>
      )}
      {tab === 'info' && (
        <div className="swap-card content-card-narrow">
          <h2 className="info-title">À propos</h2>
          <ul className="section-list">
            <li><b>DEX Swap App</b> — v1.0</li>
            <li>Développé par <b>Euloge Mabiala</b></li>
            <li>Frontend&nbsp;: React 18, ethers.js, Uniswap SDK</li>
            <li>Déploiement&nbsp;: <a href="https://eulogep.github.io/dex-swap-app/" target="_blank" rel="noopener noreferrer" className="link-accent">GitHub Pages</a></li>
            <li>Code source&nbsp;: <a href="https://github.com/eulogep/dex-swap-app" target="_blank" rel="noopener noreferrer" className="link-accent">github.com/eulogep/dex-swap-app</a></li>
          </ul>
          <div className="support-note">Open source & sans collecte de données.</div>
        </div>
      )}

      {/* Toast notification */}
      {toast.show && (
        <div className={`toast ${toast.status}`} role="alert" aria-live="assertive">
          {toast.message}
        </div>
      )}
      <footer className="app-footer">
        <span>Réalisé par <b>Euloge Mabiala</b></span>
      </footer>
    </div>
  );
}

export default App;
