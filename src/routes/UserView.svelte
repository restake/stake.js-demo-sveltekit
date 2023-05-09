<script lang="ts">
    import { chainIds, type MetaMaskEthereumProvider } from "$lib/metamask";
    import errorMessage, { interceptError } from "$lib/store/errorMessage";
    import { useAccount, useChainId } from "$lib/store/ethereum";

    export let provider: MetaMaskEthereumProvider & typeof window.ethereum;
    let chainId = useChainId(provider);
    let connectedAddress = useAccount(provider);

    function resolveChainName(chainId: string | null): string {
        const parsed = Number(chainId);
        return chainIds[parsed] ?? `unknown (${chainId})`;
    }

    async function connect() {
        if ($connectedAddress) {
            return;
        }

        // Throw result away, as store listens for account changes
        await interceptError(provider.request({ method: "eth_requestAccounts" }))
            .catch((error) => {
                console.error("Connect failed", error);
            })
            .then(() => {
                errorMessage.set(undefined);
            });
    }

    $: console.log("Using network", $chainId);
    $: console.log("Using account", $connectedAddress);
</script>

<style>
    pre {
        display: inline;
    }
</style>

<div>
    {#if $connectedAddress}
        connected to <pre>{$connectedAddress}</pre>
        via chain
        <pre>{resolveChainName($chainId)}</pre>
    {:else}
        <button on:click={() => connect()}>Connect</button>
    {/if}
</div>
