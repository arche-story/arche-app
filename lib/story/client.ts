import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Aeneid Testnet Configuration (Duplicated here to avoid Client Component imports)
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

export function getStoryClient() {
  const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
  
  if (!privateKey) {
      console.error("WALLET_PRIVATE_KEY is missing in environment variables.");
      // For build time safety, return null or throw? 
      // Throwing is better to catch config errors early.
      throw new Error("Server configuration error: WALLET_PRIVATE_KEY is missing.");
  }

  const account = privateKeyToAccount(privateKey);
  const transport = http(process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || "https://aeneid.storyrpc.io");

  const walletClient = createWalletClient({
    account,
    chain: aeneid,
    transport,
  });

  const config: StoryConfig = {
    wallet: walletClient,
    transport,
    chainId: "aeneid",
  };

  return StoryClient.newClient(config);
}

export function getServerAccount() {
    const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
    if (!privateKey) return null;
    return privateKeyToAccount(privateKey);
}
