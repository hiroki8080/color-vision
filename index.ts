import { init, runWasix } from "@wasmer/sdk";
import markdownRendererUrl from "./sample.wasm?url";

async function initialize() {
    await init();
    return WebAssembly.compileStreaming(fetch(markdownRendererUrl));
}

function debounce(func: (...args: any[]) => void, delay: number): (...args: any[]) => void {
    let debounceTimer: ReturnType<typeof setTimeout>;

    return function(...args: any[]) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(...args), delay);
    };
}

async function renderMarkdown(module: WebAssembly.Module, markdown: string) {
    const instance = await runWasix(module, {});
    const stdin = instance.stdin.getWriter();
    const encoder = new TextEncoder();

    await stdin.write(encoder.encode(markdown));
    await stdin.close();

    const result = await instance.wait();
    const message = new TextDecoder().decode(new Uint8Array(result.stdoutBytes));
    return result.ok ? message : null;
}

async function main() {
    const module = await initialize();
    const output = document.getElementById("html-output") as HTMLIFrameElement;
    const markdownInput = document.getElementById("markdown-input") as HTMLTextAreaElement;

    const debouncedRender = debounce(async () => {
        const renderedHtml = await renderMarkdown(module, markdownInput.value);
        if (renderedHtml) {
            output.srcdoc = renderedHtml;
        }
    }, 500); // 500 milliseconds debounce period

    markdownInput.addEventListener("input", debouncedRender);
}

main();