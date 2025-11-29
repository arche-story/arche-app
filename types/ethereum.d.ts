// types/ethereum.d.ts
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: {
        method: string;
        params?: Array<any> | Record<string, any>;
      }) => Promise<any>;
      on?: (event: string, handler: Function) => void;
      removeListener?: (event: string, handler: Function) => void;
    };
  }
}

export {};