import { Scene } from "src/interfaces/scene";
import { GlShader } from "./utilities/GlShader";
import GUI from "lil-gui";
import { Transform } from "./utilities/Transform";
import { Camera } from "./utilities/Camera";
import { TextureGL } from "./utilities/TextureGL";
import { earthTexture } from "../textures";
import { GLGeometry } from "./utilities/GLGeometry";
import { Sphere } from "../meshes/Sphere";

export class GlScene1 implements Scene {
    private gl: WebGL2RenderingContext;
    private shader: GlShader;

    private earthTexture: TextureGL;
    private camera: Camera = new Camera();
    private ObjectTransform: Transform = new Transform();
    private sphere: GLGeometry;
    sphereHeightSegments = 32;
    sphereWidthSegments = 32;

    update(deltaTime: number): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.camera.update(deltaTime);

        this.gl.bindVertexArray(this.sphere.vao);

        this.shader.Bind();
        this.shader.SetUniform1i("u_texture", 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.earthTexture.texture);

        this.shader.SetUniformMatrix(
            "projection",
            this.camera.projectionMatrix
        );
        this.shader.SetUniformMatrix("view", this.camera.viewMatrix);
        this.shader.SetUniformMatrix("model", this.ObjectTransform.GetMatrix());

        this.gl.drawElements(
            this.gl.TRIANGLES,
            this.sphere.geometry.indices.length,
            this.gl.UNSIGNED_INT,
            0
        );
    }
    render(): void {}
    init(canvas: HTMLCanvasElement, gui: GUI | undefined): void {
        this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
        this.gl.enable(this.gl.DEPTH_TEST);
        const sceneGUI = gui.addFolder("Scene1");

        sceneGUI.add(this, "restartScene");


        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.restartScene();
    }
    restartScene() {
        this.gl.clearColor(0.0, 0, 0, 1);

        this.shader = new GlShader(this.gl, VertexShader, FragmentShader);
        this.sphere = new GLGeometry(this.gl, new Sphere(16,16,true))
        this.earthTexture = new TextureGL(this.gl, earthTexture);
    }
}

export const VertexShader = `#version 300 es
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 color;
layout (location = 2) in vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 fragUV;

void main() {
  gl_Position = projection * view * model * vec4(position, 1.0f); 
  fragUV = uv;
}
`;

export const FragmentShader = `#version 300 es
precision mediump float;
out vec4 fragColor;
in vec2 fragUV;
uniform sampler2D u_texture;
void main() {
  fragColor = texture(u_texture, fragUV);
}`;
