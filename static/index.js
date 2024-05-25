(function () {
    localStorage.setItem("color-vision-data", "");
    const canvas = document.getElementById("canvas-input");
    const imgText = document.getElementById("img-text");
    const resText = document.getElementById("res-text");
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
    var point_list = [];
    var id = 1;
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
                beforeAngle =  Math.abs(radian * (180 / Math.PI));
                interval = 5;
                beforeY = startY;
                beforeX = startX;
            }else{
                let radian = Math.atan2(startY - beforeY, startX - beforeX);
                let angle =  Math.abs(radian * (180 / Math.PI));
                interval = 5;
                beforeY = startY;
                beforeX = startX;
                if (Math.abs(beforeAngle - angle) > threshold){
                    console.log("beforeAngle : " + beforeAngle);
                    console.log("angle : " + angle);
                    console.log("diff : " + Math.abs(beforeAngle - angle));
                    setPoint(beforeX, beforeY);
                }
                beforeAngle =  Math.abs(angle);
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
        let point = [x, y]
        var near = false;
        points.forEach(element => {
            // console.log("diff1 : " + Math.abs(point[0]-element[0]));
            // console.log("diff2 : " + Math.abs(point[1]-element[1]));
            if (Math.abs(point[0]-element[0]) < 15 && Math.abs(point[1]-element[1]) < 15) {
                near = true;
            }
        });
        if (!near) {
            points.push(point);
        }
        return near;
    }

    function onCanvasMouseUp(event) {
        if(isDrawing){
            scrutinize();
            let near = setPoint(startX, startY);
            point_list.push({"id": id++, "points": points, "outer_closed": near});
            data = {"input": point_list};
            point_list_str = JSON.stringify(data);
            localStorage.setItem("color-vision-data", point_list_str);
            imgText.textContent = point_list_str;
            imgText.focus();
            setInterval(chnageResTextFocus, 500); // Forcibly generate input event by focus change.
            setInterval(chnageImgTextFocus, 1000); // Forcibly generate input event by focus change.
        }
        points = [];
        isDrawing = false;
        beforeAngle = 0;
        firstCheck = true;
    }

    function chnageResTextFocus(){
        resText.focus();
    }

    function chnageImgTextFocus(){
        imgText.textContent = localStorage.getItem("color-vision-data");
        imgText.focus();
    }

    function callback() {
        console.log('callback');
    }

    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver(callback);
    observer.observe(imgText, config);
    observer.disconnect();

    // function onCanvasMouseLeave(event) {
    //     if(isDrawing){
    //         scrutinize();
    //         setPoint(startX, startY);
    //     }
    //     scrutinize();
    // }

    function scrutinize(){
        let src = cv.imread('canvas-input');
        let dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        let dstTh = new cv.Mat();
        cv.threshold(dst, dstTh, 64, 255, cv.THRESH_BINARY)
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(dstTh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0; i < contours.size(); i++)
        {
            var cnt = contours.get(i);
            var area = cv.contourArea(cnt, false);
            // console.log("area = %o", area);
            let color = new cv.Scalar(255, 255, 255);
            if (area > 5000 && area < 50000) cv.drawContours(dst, contours, i, color, cv.FILLED);
        }
        // cv.imshow("canvas-result",dst);

        src.delete();
        dst.delete();
        dstTh.delete();
        contours.delete();
        hierarchy.delete();
    }

}());