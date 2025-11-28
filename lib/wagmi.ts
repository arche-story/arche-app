import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const aeneid = defineChain({
  id: 1315,
  name: 'Aeneid',
  network: 'aeneid',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
    public: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'StoryScan', url: 'https://aeneid.storyscan.xyz' },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [aeneid],
  connectors: [
    injected(),
  ],
  transports: {
    [aeneid.id]: http(),
  },
  ssr: true, 
})
