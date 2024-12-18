import { GlScene1 } from "src/gl/Scene1GL";
import { GlScene2 } from "src/gl/Scene2GL";
import { Scene } from "src/shared/scene";
import { WebGPUScene1 } from "src/webgpu/Scene1WebGPU";

export const WebGLSceneMap: Map<string, new () => Scene> = new Map<
    string,
    new () => Scene
>();
WebGLSceneMap.set("scene1", GlScene1);
WebGLSceneMap.set("scene2", GlScene2);

export const WebGPUSceneMap: Map<string, new () => Scene> = new Map<
    string,
    new () => Scene
>();
WebGPUSceneMap.set("scene1", WebGPUScene1);

export const BuildScene = (
    renderer: "webgl2" | "webgpu",
    scenename: string
): Scene => {
    let sceneClass:new ()=>Scene;
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
