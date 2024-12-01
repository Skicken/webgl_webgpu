import { mat4, quat, vec3 } from "gl-matrix";
import { aspectRatio } from "src/general";
import { Input } from "src/input";
export class Camera {
    sensivity = 10;
    origin: vec3 = [0, 0, 0];
    orientation: quat = quat.create();
    viewMatrix: mat4 = mat4.create();
    projectionMatrix: mat4 = mat4.create();
    position: vec3 = [0, 0, 0];
    up: vec3 = [0, 1, 0];
    yaw = 0;
    pitch = 0;
    radius = 10;
    minRadius = 3;
    maxRadius = 20;
    constructor() {
        this.projectionMatrix = mat4.perspective(
            mat4.create(),
            aspectRatio,
            1,
            0.1,
            100
        );
    }
    update(deltaTime: number) {
        this.pitch += Input.mouseDelta.y * this.sensivity * deltaTime;
        this.yaw += Input.mouseDelta.x * this.sensivity * deltaTime;

        this.radius += Input.scroll * this.sensivity * deltaTime;
        this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius));

        const pitchLimit = 90 - 0.1;
        this.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, this.pitch));

        quat.identity(this.orientation);

        this.orientation = quat.fromEuler(
            this.orientation,
            this.pitch,
            this.yaw,
            0
        );

        const offset: vec3 = [0, 0, this.radius];
        vec3.transformQuat(offset, offset, this.orientation);
        vec3.add(this.position, this.origin, offset);

        this.viewMatrix = mat4.lookAt(
            mat4.create(),
            this.position,
            this.origin,
            this.up
        );
    }
}
