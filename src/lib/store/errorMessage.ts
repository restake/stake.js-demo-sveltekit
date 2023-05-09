import { writable } from "svelte/store";

import { isMetaMaskError } from "$lib/metamask";

export const errorMessage = writable<string | undefined>();

export function interceptError<T>(p: Promise<T>): Promise<T> {
    return p.catch((error) => {
        if (isMetaMaskError(error)) {
            errorMessage.set(error.message);
        } else if (error instanceof Error) {
            errorMessage.set(error.message);
        } else {
            errorMessage.set(`${error}`);
        }
        throw error;
    });
}

export default errorMessage;
