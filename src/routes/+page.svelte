<script lang="ts">
    import { onMount } from "svelte";
    import detectProvider from "@metamask/detect-provider";

    import noMetamask from "$lib/img/no-metamask.jpg";
    import { chainIds, isMetaMaskError, type MetaMaskEthereumProvider } from "../lib/metamask";

    let errorMessage: string | null = null;
    let connectedAddress: string | null;
    let chainId: string | null;

    let ethereumProvider: (MetaMaskEthereumProvider & typeof window.ethereum) | null = null;

    // Hide picture until mount is done - don't want to make it flash
    let mountDone = false;

    onMount(async () => {
        ethereumProvider = await detectProvider();
        mountDone = true;
    });

    async function connect() {
        if (!ethereumProvider) {
            return;
        }

        if (ethereumProvider !== window.ethereum) {
            console.warn("detected provider !== window.ethereum, multiple wallet extensions installed?");
        }

        try {
            chainId = await ethereumProvider.request({ method: "eth_chainId" });
        } catch (e) {
            console.error(e);
            if (isMetaMaskError(e)) {
                errorMessage = `Failed to get current chain ID: ${e.message}`;
            }
            return;
        }
        try {
            const accounts = await ethereumProvider.request({ method: "eth_requestAccounts" });
            if (accounts.length > 0) {
                connectedAddress = accounts[0];
            } else {
                errorMessage = "No ethereum accounts found?";
                return;
            }
        } catch (e) {
            console.error(e);
            if (isMetaMaskError(e)) {
                errorMessage = `Failed to get accounts: ${e.message}`;
            }
            return;
        }

        errorMessage = "";
    }
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
            <pre>{(chainId ? chainIds[parseInt(chainId)] : null) ?? `unknown (${chainId})`}</pre>
        {:else}
            <button on:click={() => connect()}>Connect</button>
        {/if}
    </div>
{:else if !mountDone}
    Detecting Metamask...
{:else}
    <img alt="No MetaMask?" src={noMetamask} />
{/if}
