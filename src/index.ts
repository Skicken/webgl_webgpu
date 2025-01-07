import "./styles/styles.scss";

import { GUI } from "lil-gui";
import Stats from "stats.js";

import { RenderedSceneInfo } from "./interfaces/RenderedSceneInfo";
import { Scene } from "./interfaces/Scene";
import { buildCanvas, scrollFadeOut } from "./utilities/CanvasBuilder";
import { Profiler } from "./utilities/Profiler";
import { BuildScene, initRenderer, initSceneName, RendererScenesStrings } from "./utilities/SceneBuilder";
import Timer from "./utilities/Timer";

const gui = new GUI();
let canvas = buildCanvas();

let scene: Scene | undefined = undefined;
const RenderedScene: RenderedSceneInfo = {
    sceneName: initSceneName,
    renderer: initRenderer
};
let sceneInitialized = false;

const changeScene = async () => {
    sceneInitialized = false;
    Profiler.sceneName = RenderedScene.sceneName;
    Profiler.renderer = RenderedScene.renderer;

    canvas.remove();
    canvas = buildCanvas();
    if (scene) {
        scene.delete();
    }
    scene = BuildScene(RenderedScene.renderer, RenderedScene.sceneName);
    scene.init(canvas, gui).then(() => {
        sceneInitialized = true;
    });
};

const rendering = gui.addFolder("Rendering");
rendering
    .add(RenderedScene, "renderer", ["webgl2", "webgpu"])
    .name("Renderer")
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
    .name("Scene Name")
    .onFinishChange(() => {
        changeScene();
    });

const profiler = gui.addFolder("Profiler");
profiler.add(Profiler, "profilerExecutionInSeconds", 1, 60, 1).name("Profiler execution in seconds");
profiler.add(Profiler, "copyToClipboard").name("Copy result to clipboard");
profiler.add(Profiler, "initProfiler").name("Initialize Profiler");
profiler.add(Profiler, "state").name("Profiling state").disable(true).listen();

const fpsStats = new Stats();
fpsStats.showPanel(0);
changeScene();
document.body.appendChild(fpsStats.dom);

(function frame() {
    fpsStats.begin();

    Timer.update();
    if (sceneInitialized) {
        scene.update(Timer.deltaTime / 1000);
        scene.render();
    }
    Profiler.update(Timer.deltaTime);
    requestAnimationFrame(frame);

    fpsStats.end();
    scrollFadeOut();
})();
