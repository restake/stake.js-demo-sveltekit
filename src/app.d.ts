// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import { BrowserProvider, Eip1193Provider } from "ethers/types/providers";

declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface Platform {}
    }

    interface Window {
        ethereum: Eip1193Provider &
            BrowserProvider & {
                isConnected(): boolean;
            };
    }
}

export {};
