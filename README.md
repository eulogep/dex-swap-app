# DEX Swap App

A simple, accessible, and modern decentralized swap UI built with React, ethers.js, and Uniswap v3.

- Live demo: https://eulogep.github.io/dex-swap-app
- License: MIT

## What this app does

- Swap UI for common tokens (ETH, USDC, DAI, WBTC, USDT)
- Networks: Ethereum Mainnet and Sepolia
- Price preview and slippage control before sending a transaction
- Wallet connection with MetaMask (no private keys stored)
- Responsive UI, light/dark theme with persistence
- Keyboard navigation, visible focus, ARIA attributes
- In‑app help, toasts, and a short intro for first‑time users

## Requirements

- Browser with MetaMask (or a compatible EVM wallet injected as `window.ethereum`)
- Internet access to Ethereum RPC endpoints (Infura for Sepolia/Mainnet as configured in the app)

## Quick start

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm start

# Run tests
npm test

# Production build
npm run build

# Deploy to GitHub Pages (uses package.json "homepage")
npm run deploy
```

## How to use

1) Open the app and click "Connect MetaMask".
2) Choose the network (Sepolia for testing, Mainnet for real assets).
3) Select tokens, enter an amount, adjust slippage if needed.
4) Click "Simuler swap" to preview minimum received.
5) Click "Swap" and confirm in MetaMask.

Notes
- Some pairs are shown for demo; not all pairs may be tradable at any time.
- Fees and gas costs depend on network conditions.

## Accessibility

- Keyboard support on navigation and forms
- ARIA roles/labels on tabs and buttons
- Visible focus states, sufficient color contrast
- Intro and notifications avoid motion sickness (reduced, non‑blocking animations)

## Security & privacy

- 100% client‑side; no backend, no account creation
- Private keys never leave your wallet; transactions are signed by your wallet
- Always verify contract addresses and networks before confirming a transaction

## Configuration

Network and token metadata are defined in the React source (see `src/App.js`).
Adjust or add networks/tokens there if you need more coverage.

## Troubleshooting

- "Missing wallet" → Install MetaMask and refresh the page
- "Wrong network" → Use the selector in the UI or switch network in your wallet
- "Price shows --" → The demo only simulates common pairs (e.g., ETH/USDC)
- Build/serve issues → `npm install` then `npm start`; ensure Node LTS

## Contributing

Contributions, bug reports, and ideas are welcome.
- Fork the repo
- Create a branch (e.g., `feat/my-feature`)
- Commit with clear messages and open a PR

## Credits

- Uniswap v3, ethers.js, React
- Design influences: glassmorphism/neon styles

## Roadmap

- Pool discovery via Uniswap subgraph and automatic fee tier selection
- ERC‑20 approvals UX and allowance management
- Multi‑quote routing and price impact details
- i18n (FR/EN) and reduced‑motion preferences
- PWA offline shell and install prompt
- E2E tests (Playwright) and accessibility audits

## Changelog

- 2025‑09‑01: Accessibility improvements (tabs ARIA, keyboard), theme persistence, icons, animated finance background, creator section; README overhaul
- 2025‑08‑20: Initial swap form, price preview, toasts, intro overlay

## Disclaimer

This project is for educational/demo purposes. It is not financial advice. Use Mainnet at your own risk. Always review transactions before signing.
