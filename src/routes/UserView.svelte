<script lang="ts">
    import { chainIds, type MetaMaskEthereumProvider } from "$lib/metamask";
    import errorMessage, { interceptError } from "$lib/store/errorMessage";
    import { useAccount, useChainId, useConnected } from "$lib/store/ethereum";
    import { get } from "svelte/store";

    export let provider: MetaMaskEthereumProvider & typeof window.ethereum;
    let connected = useConnected(provider);
    let chainId = useChainId(provider);
    let connectedAddress = useAccount(provider);

    let selectedChainId = $chainId;
    let selectInProgress = false;
    let lastSignedData: string | undefined = undefined;

    function resolveChainName(chainId: string | undefined): string {
        if (!chainId) {
            return "unknown";
        }

        const parsed = Number(chainId);
        return chainIds[parsed] ?? `unknown (${chainId})`;
    }

    async function changeNetwork(event: Event) {
        const currentChainId = $chainId;
        const newChainId = selectedChainId;
        if (!newChainId) {
            return;
        }

        try {
            errorMessage.set(undefined);
            selectInProgress = true;
            await interceptError(chainId.switch(newChainId));
            selectedChainId = newChainId;
        } catch (err) {
            selectedChainId = currentChainId;
        } finally {
            selectInProgress = false;
        }
    }

    async function connect() {
        if ($connectedAddress) {
            return;
        }

        // Throw result away, as store listens for account changes
        await interceptError(provider.request({ method: "eth_requestAccounts" }))
            .then(() => {
                errorMessage.set(undefined);
            })
            .catch((error) => {
                console.error("Connect failed", error);
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
    $: selectedChainId = $chainId;
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
            <select bind:value={selectedChainId} on:change={(event) => changeNetwork(event)} disabled={selectInProgress}>
                {#each Object.entries(chainIds) as [id, name]}
                    <option value="0x{parseInt(id).toString(16)}">{name}</option>
                {/each}
            </select>
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
