<script lang="ts">
    import { onMount } from "svelte";
    import detectProvider from "@metamask/detect-provider";

    import noMetamask from "$lib/img/no-metamask.jpg";
    import { chainIds, isMetaMaskError, type MetaMaskEthereumProvider, type MetaMaskPermission } from "../lib/metamask";

    let errorMessage: string | null = null;
    let connectedAddress: string | null;
    let chainId: string | null;

    let ethereumProvider: (MetaMaskEthereumProvider & typeof window.ethereum) | null = null;

    // Hide picture until mount is done - don't want to make it flash
    let mountDone = false;

    async function loadAccount() {
        if (!ethereumProvider) {
            throw new Error("No MetaMask?");
        }

        chainId = await ethereumProvider.request({ method: "eth_chainId" });
        const accounts: string[] = await ethereumProvider.request({ method: "eth_requestAccounts" });
        if (accounts.length < 1) {
            throw new Error("No ethereum accounts found?");
        }

        connectedAddress = accounts[0];
    }

    async function connect() {
        if (!ethereumProvider) {
            return;
        }

        if (ethereumProvider !== window.ethereum) {
            console.warn("detected provider !== window.ethereum, multiple wallet extensions installed?");
        }

        try {
            await loadAccount();
        } catch (e) {
            if (isMetaMaskError(e)) {
                errorMessage = e.message;
            } else if (e instanceof Error) {
                errorMessage = e.message;
            }
            console.error(e);
            return;
        }

        errorMessage = "";
    }

    function handleNetworkChange(newChainId: string) {
        chainId = newChainId;
    }

    function resolveChainName(chainId: string | null): string {
        const parsed = Number(chainId);
        return chainIds[parsed] ?? `unknown (${chainId})`;
    }

    onMount(async () => {
        ethereumProvider = await detectProvider();
        if (ethereumProvider?.isConnected()) {
            // Try loading an account automatically when we have at least
            // one permission granted.
            let loadAccountAutomatically = false;

            const permissions: MetaMaskPermission[] = await ethereumProvider.request({ method: "wallet_getPermissions" });
            if (permissions.length > 0) {
                loadAccountAutomatically = permissions.find((permission) => permission.parentCapability === "eth_accounts") !== undefined;
            }

            if (loadAccountAutomatically) {
                try {
                    await loadAccount();
                } catch (e) {
                    console.error("Failed to load account automatically", e);
                }
            }

            ethereumProvider.addListener("chainChanged", handleNetworkChange);
        }

        mountDone = true;

        return () => {
            ethereumProvider?.removeListener("chainChanged", handleNetworkChange);
        };
    });
</script>

<style>
    pre {
        display: inline;
    }
</style>

{#if ethereumProvider}
    <p>{errorMessage ?? ""}</p>
    <div>
        {#if connectedAddress}
            connected to <pre>{connectedAddress}</pre>
            via chain
            <pre>{resolveChainName(chainId)}</pre>
        {:else}
            <button on:click={() => connect()}>Connect</button>
        {/if}
    </div>
{:else if !mountDone}
    Detecting Metamask...
{:else}
    <img alt="No MetaMask?" src={noMetamask} />
{/if}
