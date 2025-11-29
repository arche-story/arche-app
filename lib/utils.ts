import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to add WIP token to MetaMask
export const addWipTokenToMetaMask = async () => {
  if (typeof window === "undefined" || !window.ethereum) return false;

  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0x1514000000000000000000000000000000000000', // Alamat WIP Aeneid
          symbol: 'WIP',
          decimals: 18,
          image: 'https://raw.githubusercontent.com/storyprotocol/brand-assets/main/logo.png',
        },
      },
    });

    if (wasAdded) {
      // Simpan "ingatan" bahwa user ini sudah nambah token
      localStorage.setItem("arche_wip_added", "true");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to add token to wallet", error);
    return false;
  }
};

// Helper buat ngecek status (untuk UI)
export const hasAddedWipToken = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("arche_wip_added") === "true";
}
