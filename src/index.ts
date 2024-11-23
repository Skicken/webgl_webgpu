import { GlScene1 } from "./gl/Scene1";
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
canvas.width = 1920;
canvas.height = 1080;

const scene = new GlScene1();
scene.init(canvas, gui);

const fps = new Stats();

fps.showPanel(0);

document.body.appendChild(fps.dom);

(function frame() {
    fps.begin();
    
    timer.lastTimestamp = timer.currentTimestamp;
    timer.currentTimestamp = performance.now();

    scene.update(timer.deltaTime)
    //rendering
    timer.updateProfiler();
    requestAnimationFrame(frame);
    fps.end();
    //setTimeout(frame, 10);
})();
