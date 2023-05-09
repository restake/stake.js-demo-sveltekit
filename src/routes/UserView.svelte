<script lang="ts">
    import { chainIds, type MetaMaskEthereumProvider } from "$lib/metamask";
    import errorMessage, { interceptError } from "$lib/store/errorMessage";
    import { useAccount, useChainId, useConnected } from "$lib/store/ethereum";

    export let provider: MetaMaskEthereumProvider & typeof window.ethereum;
    let connected = useConnected(provider);
    let chainId = useChainId(provider);
    let connectedAddress = useAccount(provider);

    function resolveChainName(chainId: string | undefined): string {
        if (!chainId) {
            return "unknown";
        }

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

    $: console.log("RPC connection ready", $connected);
    $: console.log("Using network", $chainId);
    $: console.log("Using account", $connectedAddress);
</script>

<style>
    pre {
        display: inline;
    }
</style>

<div>
    {#if !$connected}
        MetaMask RPC connection is not ready
    {:else if $connectedAddress}
        connected to <pre>{$connectedAddress}</pre>
        via chain
        <pre>{resolveChainName($chainId)}</pre>
    {:else}
        <button on:click={() => connect()}>Connect</button>
    {/if}
</div>
