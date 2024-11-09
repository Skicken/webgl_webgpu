import { canvasHeight,canvasWidth } from "./General";
import { Input } from "./Input";

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

        const alpha = 0.6; 
        const threshold = 0.5; 

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
    });
    newCanvas.addEventListener("mouseup", () => {
        Input.mouseDown = false;
    });
    newCanvas.width = canvasWidth;
    newCanvas.height = canvasHeight;
    return newCanvas;
};
