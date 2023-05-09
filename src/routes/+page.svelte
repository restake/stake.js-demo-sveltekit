<script lang="ts">
    import detectProvider from "@metamask/detect-provider";

    import noMetamask from "$lib/img/no-metamask.jpg";
    import type { MetaMaskEthereumProvider } from "../lib/metamask";
    import UserView from "./UserView.svelte";
    import errorMessage, { interceptError } from "$lib/store/errorMessage";
    import { browser } from "$app/environment";

    let ethereumProvider: (MetaMaskEthereumProvider & typeof window.ethereum) | null = null;

    async function getProvider() {
        if (!browser) {
            // TODO: disable prerender
            throw new Error("Not browser");
        }

        ethereumProvider = await detectProvider();
        if (!ethereumProvider) {
            throw new Error("No MetaMask installation detected");
        }
        return ethereumProvider;
    }

    $: if (ethereumProvider) {
        if (ethereumProvider && ethereumProvider !== window.ethereum) {
            console.warn("detected provider !== window.ethereum, multiple wallet extensions installed?");
        }

        if (ethereumProvider?.isConnected()) {
            console.log("Connected to MetaMask");
        }
    }
</script>

<p>{$errorMessage ?? ""}</p>
{#await interceptError(getProvider())}
    <p>Detecting MetaMask...</p>
{:then provider}
    <UserView {provider} />
{:catch error}
    <img alt="No MetaMask?" src={noMetamask} />
{/await}
