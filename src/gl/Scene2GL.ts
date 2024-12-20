import { mat4 } from "gl-matrix";
import { GUI } from "lil-gui";
import { PointLight } from "src/interfaces/PointLight";
import { RenderableObject } from "src/interfaces/RenderableObject";
import { Scene } from "src/interfaces/Scene";
import { Icosphere } from "src/meshes/Icosphere";
import { generateLights } from "src/shared/LightsGenerator";
import { LoadScene } from "src/utilities/GlftLoader";

import FragmentShader from "./shaders/Scene2/fragment.glsl";
import LightFragmentShader from "./shaders/Scene2/lightfragment.glsl";
import LightVertexShader from "./shaders/Scene2/lightvertex.glsl";
import VertexShader from "./shaders/Scene2/vertex.glsl";
import { Camera } from "./utilities/Camera";
import { GLGeometry } from "./utilities/GLGeometry";
import { GlShader } from "./utilities/GlShader";
import { RenderableObjectGL } from "./utilities/RenderableObjectGL";
export class GlScene2 implements Scene {
    gui: GUI;
    private gl: WebGL2RenderingContext;
    private camera: Camera = new Camera();
    private canvas: HTMLCanvasElement;
    static sceneName = "Model Lighting";
    private shader: GlShader;
    private lightShader: GlShader;

    private glrenderables: RenderableObjectGL[] = [];
    private lights: PointLight[] = [];
    private lightGeometry: GLGeometry;

    lightsNumber: number = 1;
    showLights: boolean = true;
    update(deltaTime: number): void {
        this.camera.update(deltaTime);
    }
    render(): void {
        const gl = this.gl;
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        for (const renderable of this.glrenderables) {
            this.gl.bindVertexArray(renderable.vao);
            this.shader.Bind();

            this.shader.SetUniform1i("diffuseTexture", 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, renderable.diffuse);

            this.shader.SetUniform1i("emissiveTexture", 1);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, renderable.emissive);

            this.shader.SetUniform1i("metalnessTexture", 2);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, renderable.metalness);

            this.shader.SetUniform1i("roughnessTexture", 3);
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, renderable.roughness);

            this.shader.SetUniform1i("normalTexture", 4);
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, renderable.normal);

            this.shader.SetUniform1i("aoTexture", 5);
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, renderable.ao);

            this.shader.SetUniform3fv("camPos", this.camera.position);
            this.BindLights();
            this.shader.SetUniformMatrix("model", mat4.create());
            this.shader.SetUniformMatrix(
                "projection",
                this.camera.projectionMatrix
            );
            this.shader.SetUniformMatrix("view", this.camera.viewMatrix);

            this.gl.drawElements(
                gl.TRIANGLES,
                renderable.renderableObject.indices.length,
                gl.UNSIGNED_INT,
                0
            );
        }
        if (this.showLights) {
            this.DrawLights();
        }
    }
    async init(canvas: HTMLCanvasElement, gui: GUI | undefined) {
        this.canvas = canvas;
        this.camera.maxRadius = 2;
        this.camera.radius= 0.5
        this.camera.minRadius = 0.5;
        this.camera.scrollSensivity = 3;

        this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
        this.gui = gui.addFolder(GlScene2.sceneName);

        this.gui
            .add(this, "lightsNumber", 1, 256, 1)
            .name("Light Count")
            .onFinishChange(() => {
                this.initScene();
            });
        this.gui
            .add(this, "showLights")
            .name("Show Lights")
            .onFinishChange(() => {
                this.initScene();
            });
        await this.initScene();
    }
    private BindLights() {
        this.shader.SetUniform1i("lightCount", this.lights.length);
        for (let i = 0; i < this.lights.length; i++) {
            const light = this.lights[i];
            this.shader.SetUniform1f(
                `pointLights[${i}].intensity`,
                light.intensity
            );
            this.shader.SetUniform3fv(
                `pointLights[${i}].position`,
                light.position
            );
            this.shader.SetUniform3fv(`pointLights[${i}].color`, light.color);
        }
    }
    private DrawLights() {
        this.gl.bindVertexArray(this.lightGeometry.vao);
        this.lightShader.Bind();
        this.lightShader.SetUniformMatrix(
            "projection",
            this.camera.projectionMatrix
        );
        this.lightShader.SetUniformMatrix("view", this.camera.viewMatrix);
        for (let i = 0; i < this.lights.length; i++) {
            const light = this.lights[i];
            this.lightShader.SetUniformMatrix("model", light.model);
            this.lightShader.SetUniform3fv("color", light.color);
            this.gl.drawElements(
                this.gl.TRIANGLES,
                this.lightGeometry.geometry.indices.length,
                this.gl.UNSIGNED_INT,
                0
            );
        }
    }
    private async initScene() {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.enable(this.gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1);
        this.shader = new GlShader(this.gl, VertexShader, FragmentShader);
        this.lightShader = new GlShader(
            this.gl,
            LightVertexShader,
            LightFragmentShader
        );
        const icosphere = new Icosphere(2);
        this.lightGeometry = new GLGeometry(this.gl, icosphere);
        const renderables: RenderableObject[] = await LoadScene(
            "./assets/DamagedHelmet.glb"
        );
        for (const renderable of renderables) {
            this.glrenderables.push(new RenderableObjectGL(gl, renderable));
        }
        this.lights = generateLights(this.lightsNumber, 2);
    }

    delete(): void {
        this.gui.destroy();
    }
}
