import { canvasHeight, canvasWidth } from "src/general";
import { Input } from "src/input";

export let fadeOutActive = false;
export function scrollFadeOut() {
    if (!fadeOutActive) return;

    Input.scroll *= 0.9;
    if (Math.abs(Input.scroll) < 0.001) {
        Input.scroll = 0;
        fadeOutActive = false;
        return;
    }
}
export const buildCanvas = () => {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = canvasWidth;
    newCanvas.height = canvasHeight;
    document.getElementById("canvas").appendChild(newCanvas);

    newCanvas.addEventListener("mousemove", (e) => {
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

    newCanvas.addEventListener(
        "wheel",
        (e) => {
            const wheel = e as WheelEvent;
            Input.scroll = wheel.deltaY / 100;
            fadeOutActive = true;
            scrollFadeOut();
        },
        { passive: false }
    );

    newCanvas.addEventListener("mousedown", () => {
        Input.mouseDown = true;
        newCanvas.requestPointerLock();
    });
    newCanvas.addEventListener("mouseup", () => {
        Input.mouseDown = false;
        if (document.pointerLockElement == newCanvas) {
            document.exitPointerLock();
        }
    });
    return newCanvas;
};
