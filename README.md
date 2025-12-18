# ⚡ Pokedex NFT Marketplace

> A production-ready, cross-platform mobile application that bridges **Pokémon nostalgia** with **Web3 blockchain technology**. Built with React Native, Expo, and Ethereum smart contracts.

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)](https://ethereum.org/)
[![NativeWind](https://img.shields.io/badge/NativeWind-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://nativewind.dev/)

---

## 🎬 Demo

<p align="center">
  <img src="./assets/screenshots/pokedex.gif" alt="Pokedex Marketplace Demo" width="800"/>
</p>

_Full walkthrough: browsing Pokémon, connecting MetaMask wallet, and claiming NFTs on Ethereum testnet_

---

## 🎯 What This Project Demonstrates

| Skill                          | Implementation                                             |
| ------------------------------ | ---------------------------------------------------------- |
| **Cross-Platform Development** | Single codebase for iOS, Android, and Web using Expo       |
| **Modern React Patterns**      | Hooks, Context, Proxy-based state (Valtio)                 |
| **Web3 Integration**           | MetaMask SDK, Ethers.js, Smart Contract interactions       |
| **Responsive UI**              | Platform-adaptive layouts, glassmorphism, micro-animations |
| **TypeScript**                 | Strict typing throughout the codebase                      |
| **API Integration**            | REST API consumption with React Query caching              |

---

## 🛠️ Tech Stack

### Core Framework

- **React Native 0.81** with **Expo SDK 54**
- **Expo Router** for file-system based navigation
- **TypeScript** for type safety

### Styling & UI

- **NativeWind** (Tailwind CSS for React Native)
- **Expo Linear Gradient** for premium visual effects
- **Reanimated** for 60fps animations
- Custom **glassmorphism** and **glow effects**

### State Management

- **Valtio** for reactive global state
- **React Query (TanStack)** for server-state caching

### Blockchain / Web3

- **Ethers.js v5** for Ethereum interactions
- **MetaMask SDK** for wallet connectivity
- Custom **smart contract** integration for NFT claiming

---

## ✨ Key Features

- ✅ **Dynamic Pokédex** - Browse 151+ Pokémon with infinite scroll
- ✅ **Type-Adaptive Theming** - UI colors change based on Pokémon type (Fire = Orange, Water = Blue)
- ✅ **Premium Modal** - High-fidelity NFT detail view with stats and traits
- ✅ **MetaMask Integration** - Seamless wallet connection handling multiple extensions
- ✅ **NFT Claiming Pipeline** - Full smart contract interaction flow
- ✅ **Cross-Platform** - Works on iOS, Android, and Web from single codebase

---

## ⏱️ Development Effort

**Estimated: 40+ Hours**

This project represents significant effort across:

- Architecture setup (Expo Router, NativeWind, Metro config)
- UI/UX design with premium aesthetics
- Web3 integration debugging (wallet conflicts, SDK setup)
- Smart contract interaction pipeline
- Cross-platform testing and optimization

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/pokedex-marketplace.git
cd pokedex-marketplace
npm install

# Start development server
npx expo start

# Run on specific platform
npx expo start --web      # Browser
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
```

---

## 📁 Project Structure

```
pokedex-marketplace/
├── app/                    # Expo Router pages
├── components/
│   └── ui/                 # Reusable UI components (Modal, Cards)
├── contracts/              # Smart contract ABIs
├── hooks/                  # Custom hooks (AppKit, Polyfills)
├── store/                  # Valtio state management
├── utils/                  # Helper functions (NFT Pipeline)
└── assets/                 # Images, fonts, screenshots
```

---

## 👨‍💻 Author

**George Michoulis**

React Native Developer specializing in cross-platform mobile development with Web3 integration.

- 🌐 [Portfolio](#)
- 💼 [LinkedIn](#)
- 📧 [Email](#)

---

_This project is a portfolio demonstration piece showcasing modern React Native development practices._
