(function () {
    const canvas = document.getElementById("canvas-input");
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });
    var isDrawing = false;
    var startX = 0;
    var startY = 0;
    var interval = 3;
    var beforeX = 0;
    var beforeY = 0;
    var beforeAngle = 0;
    var threshold = 30;
    var firstCheck = true;
    var points = [];
    document.getElementById("canvas-input").addEventListener("mousedown", onCanvasMouseDown);
    document.getElementById("canvas-input").addEventListener("mousemove", onCanvasMouseMove);
    document.getElementById("canvas-input").addEventListener("mouseup", onCanvasMouseUp);
    // document.getElementById("canvas-input").addEventListener("mouseleave", onCanvasMouseLeave);
    function onCanvasMouseDown(event) {
        isDrawing=true;
        startX=event.offsetX;
        startY=event.offsetY;
        interval = 5;
        beforeX = startX;
        beforeY = startY;
        setPoint(beforeX, beforeY);
    }
    function onCanvasMouseMove(event) {
        if(!isDrawing) return;
        let endX = event.offsetX;
        let endY = event.offsetY;
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.closePath();
        startX = endX;
        startY = endY;
        interval--;
        // console.log(interval);
        if(interval < 0){
            if(firstCheck){
                firstCheck = false;
                let radian = Math.atan2(startY - beforeY, startX - beforeX);
                beforeAngle = radian * (180 / Math.PI);
                interval = 5;
                beforeY = startY;
                beforeX = startX;
            }else{
                let radian = Math.atan2(startY - beforeY, startX - beforeX);
                let angle = radian * (180 / Math.PI);
                interval = 5;
                beforeY = startY;
                beforeX = startX;
                if (Math.abs(beforeAngle - angle) > threshold){
                    setPoint(beforeX, beforeY);
                }
                beforeAngle = angle;
            }
        }
    }
    function setPoint(x, y){
        // draw point
        ctx.beginPath();
        ctx.fillStyle = "blue"
        ctx.lineWidth = 8;
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        const point = [x, y]
        var near = false;
        points.forEach(element => {
            console.log(Math.abs(point[0]-element[0]));
            console.log(Math.abs(point[1]-element[1]));
            if (Math.abs(point[0]-element[0]) < 10 && Math.abs(point[1]-element[1])) {
                near = true;
            }
        });
        if (!near) {
            points.push(point);
        }
    }

    function onCanvasMouseUp(event) {
        if(isDrawing){
            scrutinize();
            setPoint(startX, startY);
        }
        console.log(points);
        points = [];
        isDrawing = false;
    }
    function onCanvasMouseLeave(event) {
        if(isDrawing){
            scrutinize();
            setPoint(startX, startY);
        }
        scrutinize();
    }

    function scrutinize(){
        let src = cv.imread('canvas-input');
        let dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        let dstTh = new cv.Mat();
        cv.threshold(dst, dstTh, 64, 255, cv.THRESH_BINARY)
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(dstTh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let endDst = new cv.Mat();
        for (let i = 0; i < contours.size(); i++)
        {
            var cnt = contours.get(i);
            var area = cv.contourArea(cnt, false);
            // console.log("area = %o", area);
            let color = new cv.Scalar(255, 255, 255);
            if (area > 5000 && area < 50000) cv.drawContours(dst, contours, i, color, cv.FILLED);
        }
        cv.imshow("canvas-result",dst);

        src.delete();
        dst.delete();
        dstTh.delete();
        contours.delete();
        hierarchy.delete();
        endDst.delete();
    }

    function onOpenCvReady(){

    }
}());