import { mat4, vec3 } from "gl-matrix";

export interface PointLight {
    intensity: number;
    position: vec3;
    color: vec3;
    model:mat4;
}
