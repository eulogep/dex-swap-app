# DEX Swap App

![Build](https://img.shields.io/github/workflow/status/eulogep/dex-swap-app/CI)
![License](https://img.shields.io/github/license/eulogep/dex-swap-app)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

---

## 🚀 Présentation

**DEX Swap App** est une application web moderne permettant de swapper des cryptomonnaies de manière totalement décentralisée sur Ethereum (Uniswap v3, Sepolia/Mainnet) avec une interface utilisateur inspirée par les meilleurs designs glassmorphism et néon (Uiverse.io). 

- **Projet personnel et vitrine technique** développé par [Euloge Mabiala](https://github.com/eulogep).
- **Usage open source** : contributions bienvenues !
- **Démo** : [lien GitHub Pages ou Vercel à compléter]

---

## 🎯 Objectifs
- Offrir une expérience de swap crypto simple, rapide et sécurisée sans intermédiaire.
- Mettre en avant les bonnes pratiques UI/UX modernes (glassmorphism, néon, animations, accessibilité).
- Servir de démonstrateur technique pour des recruteurs ou collaborateurs potentiels (React, Web3, sécurité, responsive, tests…)
- Être une base open source pour d’autres projets DEX ou dashboard crypto.

---

## 🛠️ Stack technique
- **React 18.x** (create-react-app)
- **ethers.js** (interaction blockchain)
- **Uniswap SDK v3** (logique DEX)
- **Web Speech API** (onboarding vocal)
- **CSS modules** (UI glassmorphism/neon, responsive, animations)
- **GitHub Actions** (CI/CD)
- **GitHub Pages** (déploiement)

---

## ✨ Fonctionnalités principales
- Swap ETH, USDC, DAI, WBTC, USDT sur Sepolia/Mainnet
- Sélection dynamique tokens/réseaux, logos locaux (pas d’erreur CORS)
- Simulation prix, estimation slippage, frais Uniswap AVANT le swap
- Signature transaction sécurisée via MetaMask (jamais de clé privée stockée)
- UI moderne : glassmorphism, néon, animations, responsive mobile
- Onglets (Swap, Aide, Infos) : sticky, halo animé, effet ripple, badge notification
- Introduction animée avec onboarding vocal (FR)
- Accessibilité renforcée (clavier, aria-label, focus visible)
- Historique local des swaps (optionnel)
- Notifications toast, résumé clair de la transaction

---

## 🖼️ Captures d’écran

> _(Remplacer par vos propres screenshots)_

| Swap principal | Sélecteur token | Mode mobile |
|---------------|-----------------|------------|
| ![swap](docs/swap-demo.png) | ![tokens](docs/tokens-demo.png) | ![mobile](docs/mobile-demo.png) |

---

## ⚡ Installation & démarrage

```bash
# Cloner le repo
https://github.com/eulogep/dex-swap-app.git
cd dex-swap-app

# Installer les dépendances
npm install

# Lancer en développement
npm start

# Build production
npm run build

# Déployer (GitHub Pages)
npm run deploy
```

---

## 🔒 Sécurité & bonnes pratiques
- **Jamais de clé privée stockée**
- Toutes les transactions sont signées côté wallet (MetaMask)
- Avertissement sur slippage, frais, gas
- Affichage clair des réseaux/tokens actifs
- Pas de backend : 100% client-side

---

## 🤝 Contribution
Contributions, issues et suggestions sont les bienvenues !

- Forkez le repo
- Créez une branche (`feature/ma-feature`)
- Ouvrez une Pull Request
- Lisez le [CONTRIBUTING.md](CONTRIBUTING.md) _(à créer)_

---

## ❓ FAQ rapide
- **Puis-je ajouter d’autres tokens ?** Oui, modifiez la config `TOKENS` dans le code.
- **Peut-on déployer sur d’autres réseaux ?** Oui, en adaptant la config réseaux.
- **Est-ce sécurisé ?** Oui pour le front, mais faites auditer avant tout usage réel.
- **Pourquoi local logos ?** Pour éviter les erreurs CORS et garantir l’affichage.
- **Pourquoi React 18 ?** Pour compatibilité CRA et stabilité.

---

## 👤 Auteur & Contact
- **Auteur** : Euloge Mabiala
- [GitHub](https://github.com/eulogep)
- [LinkedIn](https://www.linkedin.com/in/euloge-mabiala/)
- Contact : euloge.mabiala [at] gmail.com

---

## 🙏 Crédits & inspirations
- UI/UX : [Uiverse.io](https://uiverse.io/)
- DEX : [Uniswap](https://uniswap.org/)
- React, ethers.js, Uniswap SDK

---

## 📄 Licence

MIT — Utilisation libre, contributions bienvenues.

---

> **Ce projet est à but démonstratif et pédagogique. Merci de ne pas utiliser en production réelle sans audit de sécurité.**


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
