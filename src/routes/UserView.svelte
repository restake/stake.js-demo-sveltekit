<script lang="ts">
    import { chainIds, type MetaMaskEthereumProvider } from "$lib/metamask";
    import errorMessage, { interceptError } from "$lib/store/errorMessage";
    import { useAccount, useChainId, useConnected } from "$lib/store/ethereum";

    export let provider: MetaMaskEthereumProvider & typeof window.ethereum;
    let connected = useConnected(provider);
    let chainId = useChainId(provider);
    let connectedAddress = useAccount(provider);

    let lastSignedData: string | undefined = undefined;

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

    async function signExample() {
        lastSignedData = undefined;
        const result: string = await interceptError(
            provider.request({
                method: "eth_sign",
                params: [
                    $connectedAddress,
                    "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
                ],
            })
        );
        lastSignedData = result;
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
        <div>
            connected to <pre>{$connectedAddress}</pre>
            via chain
            <pre>{resolveChainName($chainId)}</pre>
        </div>
        <div>
            <button on:click={() => signExample()}>Sign raw data</button>
            {#if lastSignedData}
                <pre>{lastSignedData}</pre>
            {/if}
        </div>
    {:else}
        <button on:click={() => connect()}>Connect</button>
    {/if}
</div>
