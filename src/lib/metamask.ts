// https://github.com/MetaMask/detect-provider/issues/78
export interface MetaMaskEthereumProvider {
    isMetaMask?: boolean;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
}

export type MetaMaskError = {
    code: number;
    message: string;
    stack: string;
};

export function isMetaMaskError(t: any): t is MetaMaskError {
    return "code" in t && "message" in t && "stack" in t;
}

export const chainIds: Record<number, string | undefined> = {
    0x1: "mainnet",
    0x5: "goerli",
    0xaa36a7: "sepolia",
    0xe704: "linea goerli",
    0x539: "ganache",
};
