(function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    var isDrawing = false;
    var startX = 0;
    var startY = 0;
    document.getElementById("canvas").addEventListener("mousedown", onCanvasMouseDown);
    document.getElementById("canvas").addEventListener("mousemove", onCanvasMouseMove);
    document.getElementById("canvas").addEventListener("mouseup", onCanvasMouseUp);
    document.getElementById("canvas").addEventListener("mouseleave", onCanvasMouseLeave);
    function onCanvasMouseDown(event) {
        isDrawing=true;
        startX=event.offsetX;
        startY=event.offsetY;
    }
    function onCanvasMouseMove(event) {
        if(!isDrawing) return;
        const endX = event.offsetX;
        const endY = event.offsetY;
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        startX = endX;
        startY = endY;
    }
    function onCanvasMouseUp(event) {
        isDrawing = false;
    }
    function onCanvasMouseLeave(event) {
        isDrawing = false;
    }
}());