# DEX Swap App

**Un swap décentralisé moderne pour Ethereum (Uniswap v3, Sepolia/Mainnet) avec UI glassmorphism & néon inspirée Uiverse.io**

---

## 🚀 Fonctionnalités principales
- Swap crypto sans intermédiaire (ETH, USDC, DAI, WBTC, USDT)
- Sélection dynamique des tokens et réseaux (Sepolia/Mainnet)
- Simulation du prix, estimation du slippage et frais avant swap
- Signature de transaction sécurisée via MetaMask (jamais de clé privée stockée)
- UI/UX ultra-moderne : glassmorphism, néon, animations fluides, responsive mobile
- Onglets (Swap, Aide, Infos) avec effets halo, ripple, badge, sticky
- Introduction animée avec onboarding vocal (FR)
- Accessibilité renforcée (clavier, aria-label, focus visible)
- Historique local des swaps (optionnel)

## 🛠️ Stack technique
- React 18.x (create-react-app)
- ethers.js
- Uniswap SDK v3
- Web Speech API (onboarding vocal)
- Logos tokens locaux (pas d’erreur CORS)

## 📦 Installation
```bash
# Cloner le repo
https://github.com/<TON-REPO>
cd dex-swap-app

# Installer les dépendances
npm install

# Lancer en dev
npm start
```

## 📝 Déploiement
```bash
npm run deploy
```
Le build est publié sur GitHub Pages (voir package.json > homepage).

## 🔒 Sécurité
- Jamais de clé privée stockée
- Transactions signées côté wallet uniquement
- Infos claires sur slippage, frais, gas

## ✨ Inspirations & crédits
- UI/UX : [Uiverse.io](https://uiverse.io/)
- DEX : [Uniswap](https://uniswap.org/)
- Auteur : Euloge Mabiala

## 📄 Licence
MIT

---

> **Projet pédagogique / personnel.**
> Merci de ne pas utiliser en production réelle sans audit de sécurité.
