import { onMount } from "svelte";
import { writable } from "svelte/store";
import type { Readable } from "svelte/store";

export function useChainId(ethereumProvider: typeof window.ethereum | null): Readable<string> {
    const { subscribe, set } = writable<string>();

    function handleChainIdChange(newChainId: string) {
        set(newChainId);
    }

    onMount(async () => {
        const chainId: string | null = (await ethereumProvider?.request({ method: "eth_chainId" })) ?? null;
        set(chainId);

        ethereumProvider?.addListener("chainChanged", handleChainIdChange);
        return () => {
            ethereumProvider?.removeListener("chainChanged", handleChainIdChange);
        };
    });

    return {
        subscribe,
    };
}

export function useAccount(ethereumProvider: typeof window.ethereum | null): Readable<string> {
    const { subscribe, set } = writable<string>();

    function handleAccountsChanged(newAccounts: string[]) {
        if (newAccounts.length) {
            set(newAccounts[0]);
        }
    }

    onMount(async () => {
        const accounts: string[] | null = (await ethereumProvider?.request({ method: "eth_accounts" })) ?? null;
        if (accounts?.length) {
            set(accounts[0]);
        }

        ethereumProvider?.addListener("accountsChanged", handleAccountsChanged);
        return () => {
            ethereumProvider?.removeListener("accountsChanged", handleAccountsChanged);
        };
    });

    return {
        subscribe,
    };
}
