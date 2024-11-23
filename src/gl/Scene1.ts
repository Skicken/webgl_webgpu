import { Scene } from "src/interfaces/scene";
import {
    cubeColorOffset,
    cubePositionOffset,
    cubeUVOffset,
    cubeVertexArray,
    cubeVertexCount,
    cubeVertexSize
} from "../meshes/Cube";
import { GlShader } from "./utilities/GlShader";
import GUI from "lil-gui";
import { mat4, vec3 } from "gl-matrix";
import { Transform } from "./utilities/Transform";

export class GlScene1 implements Scene {
    private gl: WebGL2RenderingContext;
    private shader: GlShader;
    private bufferID: WebGLBuffer;
    private vao: WebGLVertexArrayObject;

    private cameraPosition: vec3 = [-10, 0, 0];
    private cameraFront: vec3 = [1, 0, 0];
    private cameraUp: vec3 = [0, 1, 0];
    private ObjectTransform: Transform = new Transform();

    update(deltaTime: number): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const cameraView = mat4.create();
        const cameraProjection = mat4.create();
        mat4.lookAt(
            cameraView,
            this.cameraPosition,
            this.cameraFront,
            this.cameraUp
        );
        mat4.perspective(cameraProjection, 45, 1, 0.1, 100);


        const rotation = this.ObjectTransform.eulerRotation;
        this.ObjectTransform.eulerRotation = [rotation[0] + 0.1, 0, rotation[2]];
        this.shader.Bind();
        this.shader.SetUniformMatrix("projection", cameraProjection);
        this.shader.SetUniformMatrix("view", cameraView);
        this.shader.SetUniformMatrix("model", this.ObjectTransform.GetMatrix());

        this.gl.drawArrays(this.gl.TRIANGLES, 0, cubeVertexCount);
    }
    render(): void {}
    init(canvas: HTMLCanvasElement, gui: GUI | undefined): void {
        this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.restartScene();
    }
    restartScene() {
        this.gl.clearColor(0.0, 0, 0, 1);
        this.shader = new GlShader(this.gl, VertexShader, FragmentShader);

        this.bufferID = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferID);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            cubeVertexArray,
            this.gl.STATIC_DRAW
        );

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(
            0,
            4,
            this.gl.FLOAT,
            false,
            cubeVertexSize,
            cubePositionOffset
        );

        this.gl.enableVertexAttribArray(1);
        this.gl.vertexAttribPointer(
            1,
            4,
            this.gl.FLOAT,
            false,
            cubeVertexSize,
            cubeColorOffset
        );

        this.gl.enableVertexAttribArray(2);
        this.gl.vertexAttribPointer(
            2,
            2,
            this.gl.FLOAT,
            false,
            cubeVertexSize,
            cubeUVOffset
        );
        this.ObjectTransform.position = [0, 0, 0];
        this.ObjectTransform.eulerRotation = [0, -50,-50];
        this.ObjectTransform.scale = [1,1,1]
    }
}

export const VertexShader = `#version 300 es
layout (location = 0) in vec4 position;
layout (location = 1) in vec4 color;
layout (location = 2) in vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 fragUV;

void main() {
  gl_Position = projection * view * model * position;
  fragUV = uv;
}
`;

export const FragmentShader = `#version 300 es
precision mediump float;
out vec4 fragColor;
void main() {
  fragColor = vec4(0.5, 1.0, 1.0, 1.0);
}`;
