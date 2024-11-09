import { mat4, vec3 } from "gl-matrix";
import { PointLight } from "src/interfaces/PointLight";

function getEvenPositionInSphere(index: number, count: number, radius: number): vec3 {
    const phi = Math.acos(1 - 2 * (index + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;

    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const x = radius * sinPhi * cosTheta;
    const y = radius * sinPhi * sinTheta;
    const z = radius * cosPhi;

    return vec3.fromValues(x, y, z);
}
function getColorVariation(index: number, count: number): vec3 {
    const t = index / count;
    const r = 0.5 + 0.5 * Math.sin(2 * Math.PI * t);
    const g = 0.5 + 0.5 * Math.sin(2 * Math.PI * t + Math.PI / 3);
    const b = 0.5 + 0.5 * Math.sin(2 * Math.PI * t + 2 * Math.PI / 3);
    return vec3.fromValues(r, g, b);
}

export const generateLights = (
    lightCount: number,
    radius: number
): PointLight[] => {
    const lights: PointLight[] = [];

    for (let i = 0; i < lightCount; i++) {
        const position = getEvenPositionInSphere(i, lightCount, radius);
        const color = getColorVariation(i, lightCount);
        const light: PointLight = {
            intensity: 0.1,
            position: position,
            color: color,
            model: mat4.create()
        };

        light.model = mat4.translate(light.model, light.model, light.position);
        light.model = mat4.scale(
            light.model,
            light.model,
            vec3.fromValues(0.05, 0.05, 0.05)
        );

        lights.push(light);
    }
    return lights;
};
