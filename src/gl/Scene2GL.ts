import { GUI } from "lil-gui";
import { Sphere } from "src/meshes/Sphere";
import { Scene } from "src/shared/scene";
import earthTexture from "src/textures/earth.jpg";
import earthCloudsTexture from "src/textures/earth_clouds.jpg";
import earthNightTexture from "src/textures/earth_night.jpg";

import { Camera } from "./utilities/Camera";
import { GLGeometry } from "./utilities/GLGeometry";
import { GlShader } from "./utilities/GlShader";
import { TextureGL } from "./utilities/TextureGL";
import { Transform } from "./utilities/Transform";

export class GlScene2 implements Scene {
    private gl: WebGL2RenderingContext;
    private shader: GlShader;

    private earthTexture: TextureGL;
    private earthNight: TextureGL;
    private earthClouds: TextureGL;

    private camera: Camera = new Camera();
    private ObjectTransform: Transform = new Transform();
    private sphere: GLGeometry;
    sphereHeightSegments = 32;
    sphereWidthSegments = 32;

    update(deltaTime: number): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        const rotation = this.ObjectTransform.eulerRotation;
        this.ObjectTransform.eulerRotation = [
            rotation[0],
            rotation[1] + deltaTime,
            rotation[2]
        ];

        this.camera.update(deltaTime);

        this.gl.bindVertexArray(this.sphere.vao);

        this.shader.Bind();
        this.shader.SetUniform1i("earth_day", 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.earthTexture.texture);

        this.shader.SetUniform1i("earth_night", 1);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.earthNight.texture);

        this.shader.SetUniform1i("earth_clouds", 2);
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.earthClouds.texture);

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
    init(canvas: HTMLCanvasElement, gui: GUI | undefined) {
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
        this.sphere = new GLGeometry(this.gl, new Sphere(128, 128, true));
        this.earthTexture = new TextureGL(this.gl, earthTexture);
        this.earthNight = new TextureGL(this.gl, earthNightTexture);
        this.earthClouds = new TextureGL(this.gl, earthCloudsTexture);
        this.ObjectTransform.scale = [1, 0.95, 1];
    }

    delete(): void {
        throw new Error("Method not implemented.");
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
out vec3 normal;

void main() {
  gl_Position = projection * view * model * vec4(position, 1.0f); 
  fragUV = uv;
  normal = normalize(vec3(model * vec4(position, 1.0f)));
}
`;

export const FragmentShader = `#version 300 es
precision mediump float;
out vec4 fragColor;
in vec2 fragUV;
in vec3 normal;

uniform sampler2D earth_day;
uniform sampler2D earth_night;
uniform sampler2D earth_clouds;

vec3 lightDirection = vec3(-1.0, 0.0, 0.0);
void main() {
    float intensity = dot(normal, lightDirection);

    vec4 earthColor = mix(texture(earth_night, fragUV), texture(earth_day, fragUV), intensity) + texture(earth_clouds, fragUV);
    fragColor = earthColor;
}`;
