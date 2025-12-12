import { CreateConfigParameters } from 'wagmi';

import {
    arbitrum,
    aurora,
    avalanche,
    base,
    bsc,
    celo,
    gnosis,
    mainnet,
    monadTestnet,
    optimism,
    polygon,
    sepolia,
    zora,
} from 'viem/chains';

export const chains: CreateConfigParameters['chains'] = [
  mainnet,
  polygon,
  avalanche,
  arbitrum,
  bsc,
  optimism,
  gnosis,
  zora,
  base,
  celo,
  aurora,
  sepolia,
  monadTestnet,
];