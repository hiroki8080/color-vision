import { init, runWasix } from "@wasmer/sdk";
import markdownRendererUrl from "./src/main.wasm?url";

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

async function renderCanvas(module: WebAssembly.Module, tmpText: string) {
    const instance = await runWasix(module, {});
    // const stdin = instance.stdin.getWriter();
    // const encoder = new TextEncoder();

    // await stdin.write(encoder.encode(markdown));
    // await stdin.close();

    // const result = await instance.wait();
    // return result.ok ? result.stdoutUtf8 : null;
    return null;
}

async function main() {
    const module = await initialize();
    const canvas = document.getElementById("canvas") as HTMLIFrameElement;
    const tmpText = document.getElementById("tmp-text") as HTMLTextAreaElement;

    const debouncedRender = debounce(async () => {
        // const renderedHtml = await renderCanvas(module, tmpText.value);
        // if (renderedHtml) {
        //     canvas.srcdoc = renderedHtml;
        // }
    }, 500); // 500 milliseconds debounce period

    tmpText.addEventListener("input", debouncedRender);
}

main();