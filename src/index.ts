import { canvasHeight, canvasWidth } from "./general";
import { GlScene1 } from "./gl/Scene1GL";
import { Input } from "./input";
import { timer as timer } from "./profiler";
import "./styles/styles.scss";
import GUI from "lil-gui";
import Stats from "stats.js";

const gui = new GUI();
const profiler = gui.addFolder("Profiler");

profiler.add(timer, "profilerExecutionInSeconds", 1, 60, 1);
profiler.add(timer, "startProfiler");
profiler.add(timer, "stopProfiler");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const scene = new GlScene1();
scene.init(canvas, gui);

const fps = new Stats();

fps.showPanel(0);

document.body.appendChild(fps.dom);

canvas.addEventListener("mousemove", (e) => {
    if (!Input.mouseDown) {
        Input.mouseDelta = { x: 0, y: 0 };
        Input.previousMouseDelta = { x: 0, y: 0 };
        return;
    }

    const alpha = 0.6; // Smoothing factor.
    const threshold = 0.5; // Deadzone threshold.

    const mouse: MouseEvent = e as MouseEvent;

    // Smooth deltas using exponential moving average.
    let smoothedDeltaX =
        alpha * Input.previousMouseDelta.x + (1 - alpha) * mouse.movementX;
    let smoothedDeltaY =
        alpha * Input.previousMouseDelta.y + (1 - alpha) * mouse.movementY;

    // Apply deadzone.
    if (Math.abs(smoothedDeltaX) < threshold) smoothedDeltaX = 0;
    if (Math.abs(smoothedDeltaY) < threshold) smoothedDeltaY = 0;

    // Update input state.
    Input.previousMouseDelta = { x: smoothedDeltaX, y: smoothedDeltaY };
    Input.mouseDelta = { x: smoothedDeltaX, y: smoothedDeltaY };
    Input.mousePosition = { x: mouse.clientX, y: mouse.clientY };
});


let fadeOutActive = false;
canvas.addEventListener("wheel", (e) => {
    const wheel = e as WheelEvent;
    Input.scroll = wheel.deltaY / 100;
    fadeOutActive = true;
    fadeOut();
}, { passive: false });

function fadeOut() {
    if (!fadeOutActive) return;

    Input.scroll *= 0.95; 
    if (Math.abs(Input.scroll) < 0.001) {
        Input.scroll = 0;
        fadeOutActive = false;
        return;
    }
    requestAnimationFrame(fadeOut);
}

canvas.addEventListener("mousedown", () => {
    Input.mouseDown = true;
    canvas.requestPointerLock();
});
canvas.addEventListener("mouseup", () => {
    Input.mouseDown = false;
    if (document.pointerLockElement == canvas) {
        document.exitPointerLock();
    }
});

(function frame() {
    fps.begin();

    timer.lastTimestamp = timer.currentTimestamp;
    timer.currentTimestamp = performance.now();

    scene.update(timer.deltaTime / 1000);
    //rendering
    timer.updateProfiler();
    requestAnimationFrame(frame);
    fps.end();
    //setTimeout(frame, 10);
})();
