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
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const imgText = document.getElementById("img-text") as HTMLTextAreaElement;
    const resText = document.getElementById("res-text") as HTMLTextAreaElement;

    const debouncedRender = debounce(async () => {
        const message = await processImgText(module, imgText.textContent);
        if (message) {
            resText.textContent = message;
            const data = JSON.parse(resText.textContent);
            updateData(data);
            render(data);
        }
    }, 500); // 500 milliseconds debounce period

    imgText.addEventListener("focusout", debouncedRender);
}

function updateData(data){
    let points_str = localStorage.getItem("color-vision-data") as String;
    let points = JSON.parse(points_str) as JSON;
    points["input"].forEach(input_material => {
        data["output"].forEach(output_material => {
            if(input_material.id == output_material.id){
                input_material.position = output_material.position;
                input_material.angle = output_material.angle;
                input_material.points = output_material.points;
            }
        });
    });
    localStorage.setItem("color-vision-data", JSON.stringify(points));
}

function render(data){
    const canvas = document.getElementById("canvas-result") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data["output"].forEach(material => {
        const x = material["position"]["x"];
        const y = material["position"]["y"];
        const size = material["size"] / 2;
        const angle = material["angle"];
        if (material["type"] == "Circle") {
            drawCircle(x, y, size, angle, ctx);
        }else if (material["type"] == "Line") {
            drawLine(
                material["points"][0][0], material["points"][0][1],
                material["points"][1][0], material["points"][1][1], ctx
            );
        }
    });
}

function drawCircle(x: Number, y: Number, size: Number, angle: Number, ctx: CanvasRenderingContext2D){
    ctx.strokeStyle = 'green';
    ctx.fillStyle = 'green';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(x, y);
    const base_angle = (2 * Math.PI) - (angle/(2 * Math.PI));
    ctx.arc(x, y, size, base_angle - (1.99 * Math.PI), base_angle);
    ctx.closePath();
    ctx.fill();

}

function drawLine(startX: Number, startY: Number, endX: Number, endY: Number, ctx: CanvasRenderingContext2D){
    ctx.strokeStyle = 'orange';
    ctx.fillStyle = 'orange';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.closePath();
    ctx.stroke();

}

main();