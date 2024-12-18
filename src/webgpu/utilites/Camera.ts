import { aspectRatio } from "src/general";
import { Input } from "src/input";
import { mat4, quat,vec3 } from "wgpu-matrix";
export class Camera {
    sensivity = 10;
    origin = vec3.fromValues(0, 0, 0);
    orientation = quat.create();
    viewMatrix = mat4.create();
    projectionMatrix = mat4.create();
    position = vec3.fromValues(0, 0, 0);
    up = vec3.fromValues(0, 1, 0);
    yaw = 0;
    pitch = 0;
    radius = 10;
    minRadius = 1;
    maxRadius = 20;
    constructor() {
        this.projectionMatrix = mat4.perspective(aspectRatio, 1, 0.1, 100);
    }
    update(deltaTime: number) {
        this.pitch += Input.mouseDelta.y * this.sensivity * deltaTime;
        this.yaw += Input.mouseDelta.x * this.sensivity * deltaTime;

        this.radius += Input.scroll * this.sensivity * deltaTime;
        this.radius = Math.max(
            this.minRadius,
            Math.min(this.maxRadius, this.radius)
        );

        const pitchLimit = 89.9;
        this.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, this.pitch));

        const pitchRad = (this.pitch * Math.PI) / 180;
        const yawRad = (this.yaw * Math.PI) / 180;

        const yawQuat = quat.fromEuler(0, yawRad, 0, "xyz");
        const pitchQuat = quat.fromEuler(pitchRad, 0, 0, "xyz");

        this.orientation = quat.multiply(yawQuat, pitchQuat);

        let offset = vec3.fromValues(0, 0, this.radius);
        offset = vec3.transformQuat(offset, this.orientation);

        this.position = vec3.add(this.origin, offset);
        this.viewMatrix = mat4.lookAt(this.position, this.origin, this.up);
    }
}
