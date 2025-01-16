import { GUI } from "lil-gui";
import { Scene } from "src/interfaces/Scene";
import { GenerateParticleBuffer } from "src/utilities/ParticleGenerator";

import FragmentShader from "./shaders/Scene1/fragment.glsl";
import VertexShader from "./shaders/Scene1/vertex.glsl";
import { Camera } from "./utilities/Camera";
import { GlShader } from "./utilities/GlShader";

export class GlScene1 implements Scene {
    gui: GUI;
    private gl: WebGL2RenderingContext;
    private shader: GlShader;
    private camera: Camera = new Camera();
    private canvas: HTMLCanvasElement;
    static sceneName = "Particle Sphere";

    vao: WebGLVertexArrayObject;
    vb: WebGLBuffer;
    stride = 16;
    particleCount = 10000;
    totalTime = 0;
    animateParticles = true;

    update(deltaTime: number): void {
        if (this.animateParticles) {
            this.totalTime += deltaTime;
        }
        this.camera.update(deltaTime);
    }
    render(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.bindVertexArray(this.vao);
        this.shader.Bind();
        this.shader.SetUniform1f("time", this.totalTime);
        this.shader.SetUniformMatrix(
            "projection",
            this.camera.projectionMatrix
        );
        this.shader.SetUniformMatrix("view", this.camera.viewMatrix);
        this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
    }
    async init(canvas: HTMLCanvasElement, gui: GUI | undefined) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
        this.gui = gui.addFolder(GlScene1.sceneName);
        this.gui
            .add(this, "particleCount", 10000, 1e8, 10000)
            .name("Particle Count")
            .onFinishChange(() => {
                this.initScene();
            });
        this.gui.add(this,"totalTime").name("Time").listen()
        this.gui.add(this,"animateParticles").name("Animate Particles")

        await this.initScene();
    }
    private async initScene() {
        const gl = this.gl;
        this.camera.radius = 1;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0.0, 0, 0, 1);

        const particleBuffer: Float32Array = GenerateParticleBuffer(
            this.particleCount
        );
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        this.vb = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
        gl.bufferData(gl.ARRAY_BUFFER, particleBuffer, gl.STATIC_DRAW);

        const stride = 20;
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
