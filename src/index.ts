import "./styles/styles.scss";

import { GUI } from "lil-gui";
import { canvasHeight, canvasWidth, HideNoSupport } from "src/general";
import Stats from "stats.js";

import { GlScene1 } from "./gl/Scene1GL";
import { timer } from "./profiler";
import { Scene } from "./shared/scene";
import { buildCanvas, scrollFadeOut } from "./utilities/CanvasBuilder";
import { BuildScene, RendererScenesStrings } from "./utilities/SceneBuilder";

const gui = new GUI();
let canvas = buildCanvas();
canvas.width = canvasWidth;
canvas.height = canvasHeight;
HideNoSupport();

let scene: Scene = new GlScene1();

const RenderedScene: { sceneName: string; renderer: "webgl2" | "webgpu" } = {
    sceneName: "scene1",
    renderer: "webgl2"
};
const rendering = gui.addFolder("Rendering");

const changeScene = () => {
    canvas.remove();
    canvas = buildCanvas();
    HideNoSupport();
    scene.delete();
    scene = BuildScene(RenderedScene.renderer, RenderedScene.sceneName);
    scene.init(canvas, gui);
};
rendering
    .add(RenderedScene, "renderer", ["webgl2", "webgpu"])
    .onFinishChange(() => {
        changeScene();
        guiScenes.options(RendererScenesStrings(RenderedScene.renderer));
    });

const guiScenes = rendering
    .add(
        RenderedScene,
        "sceneName",
        RendererScenesStrings(RenderedScene.renderer)
    )
    .onFinishChange(() => {
        changeScene();
    });

const profiler = gui.addFolder("Profiler");

profiler.add(timer, "profilerExecutionInSeconds", 1, 60, 1);
profiler.add(timer, "startProfiler");
profiler.add(timer, "stopProfiler");

scene.init(canvas, gui);

const fps = new Stats();

fps.showPanel(0);

document.body.appendChild(fps.dom);

(function frame() {
    fps.begin();

    timer.lastTimestamp = timer.currentTimestamp;
    timer.currentTimestamp = performance.now();

    scene.update(timer.deltaTime / 1000);
    scene.render();
    timer.updateProfiler();

    requestAnimationFrame(frame);
    fps.end();
    scrollFadeOut();
})();
