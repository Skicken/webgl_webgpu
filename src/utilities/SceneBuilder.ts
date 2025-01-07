import { Scene } from "src/interfaces/Scene";
import { GlScene1 } from "src/webgl/Scene1GL";
import { GlScene2 } from "src/webgl/Scene2GL";
import { WebGPUScene1 } from "src/webgpu/Scene1WebGPU";
import { WebGPUScene2 } from "src/webgpu/Scene2WebGPU";

export const initSceneName = GlScene1.sceneName;
export const initRenderer: "webgl2" | "webgpu" = "webgl2";

export const WebGLSceneMap: Map<string, new () => Scene> = new Map<
    string,
    new () => Scene
>();
WebGLSceneMap.set(GlScene1.sceneName, GlScene1);
WebGLSceneMap.set(GlScene2.sceneName, GlScene2);

export const WebGPUSceneMap: Map<string, new () => Scene> = new Map<
    string,
    new () => Scene
>();

WebGPUSceneMap.set(WebGPUScene1.sceneName, WebGPUScene1);
WebGPUSceneMap.set(WebGPUScene2.sceneName, WebGPUScene2);

export const BuildScene = (
    renderer: "webgl2" | "webgpu",
    scenename: string
): Scene => {
    let sceneClass: new () => Scene;
    if (renderer == "webgpu") {
        sceneClass = WebGPUSceneMap.get(scenename);
    } else {
        sceneClass = WebGLSceneMap.get(scenename);
    }
    return new sceneClass();
};
export const RendererScenesStrings = (renderer: "webgl2" | "webgpu") => {
    if (renderer == "webgpu") {
        return Array.from(WebGPUSceneMap.keys());
    } else {
        return Array.from(WebGLSceneMap.keys());
    }
};
