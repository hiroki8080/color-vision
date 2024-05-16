import { init, runWasix } from "@wasmer/sdk";
import moduleUrl from "./wasm/main.wasm?url";

async function initialize() {
    await init();
    return WebAssembly.compileStreaming(fetch(moduleUrl));
}

function debounce(func: (...args: any[]) => void, delay: number): (...args: any[]) => void {
    let debounceTimer: ReturnType<typeof setTimeout>;

    return function(...args: any[]) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(...args), delay);
    };
}

async function processImgText(module: WebAssembly.Module, imgText: string) {
    const instance = await runWasix(module, {});
    const stdin = instance.stdin.getWriter();
    const encoder = new TextEncoder();

    await stdin.write(encoder.encode(imgText));
    await stdin.close();

    const result = await instance.wait();
    if (result.stderrBytes) {
        console.log(new TextDecoder().decode(new Uint8Array(result.stderrBytes)));
    }
    const message = new TextDecoder().decode(new Uint8Array(result.stdoutBytes));
    return result.ok ? message : null;;
}

async function main() {
    const module = await initialize();
    const canvas = document.getElementById("canvas") as HTMLIFrameElement;
    const imgText = document.getElementById("img-text") as HTMLTextAreaElement;
    const resText = document.getElementById("res-text") as HTMLTextAreaElement;

    const debouncedRender = debounce(async () => {
        const message = await processImgText(module, imgText.textContent);
        if (message) {
            resText.textContent = message;
        }
    }, 500); // 500 milliseconds debounce period

    imgText.addEventListener("focusout", debouncedRender);
}

main();