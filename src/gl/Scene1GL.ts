import { GUI } from "lil-gui";
import { GenerateParticleBuffer } from "src/shared/particleGenerator";
import { Scene } from "src/shared/scene";

import FragmentShader from "./shaders/Scene1/fragment.glsl";
import VertexShader from "./shaders/Scene1/vertex.glsl";
import { Camera } from "./utilities/Camera";
import { GlShader } from "./utilities/GlShader";

export class GlScene1 implements Scene {
    private gl: WebGL2RenderingContext;
    private shader: GlShader;
    private camera: Camera = new Camera();
    private canvas: HTMLCanvasElement;
    static sceneName = "scene1";
    private gui: GUI | undefined;

    vao: WebGLVertexArrayObject;
    vb: WebGLBuffer;
    stride = 16;
    particleCount = 1000;
    totalTime = 0;
    update(deltaTime: number): void {
        this.totalTime += deltaTime;
        this.camera.update(deltaTime);
    }
    render(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.shader.Bind();
        this.shader.SetUniform1f("time", this.totalTime);
        this.shader.SetUniformMatrix(
            "projection",
            this.camera.projectionMatrix
        );
        this.shader.SetUniformMatrix("view", this.camera.viewMatrix);
        this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
    }
    init(canvas: HTMLCanvasElement, gui: GUI | undefined) {
        console.log("initializing " + GlScene1.sceneName);
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
        this.gui = gui.addFolder(GlScene1.sceneName);
        this.gui
            .add(this, "particleCount", 1000, 1e6, 100)
            .onFinishChange(() => {
                this.initScene();
            });

        this.initScene();
    }
    private initScene() {
        const gl = this.gl;
        const stride = 20;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.enable(this.gl.DEPTH_TEST);
        gl.clearColor(0.0, 0, 0, 1);

        const particleBuffer: Float32Array = GenerateParticleBuffer(
            this.particleCount
        );
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        this.vb = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
        gl.bufferData(gl.ARRAY_BUFFER, particleBuffer, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 12);

        this.shader = new GlShader(this.gl, VertexShader, FragmentShader);
    }

    delete(): void {
        this.gui.destroy();
    }
}
