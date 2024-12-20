import { GeometryBuffer } from "./GeometryBuffer";
import { Vertex } from "./Vertex";

export class Icosphere extends GeometryBuffer {
    constructor(subdivisions: number, webgl = false) {
        super();

        const vertices: Vertex[] = [];
        const t = (1 + Math.sqrt(5)) / 2; 

        const initialPositions: [number, number, number][] = [
            [-1, t, 0],
            [1, t, 0],
            [-1, -t, 0],
            [1, -t, 0],
            [0, -1, t],
            [0, 1, t],
            [0, -1, -t],
            [0, 1, -t],
            [t, 0, -1],
            [t, 0, 1],
            [-t, 0, -1],
            [-t, 0, 1]
        ];

        initialPositions.forEach(([x, y, z]) => {
            const length = Math.sqrt(x * x + y * y + z * z);

            const nx = x / length;
            const ny = y / length;
            const nz = z / length;
            const normal: [number, number, number] = [nx, ny, nz];
            const vertex: [number, number, number] = [nx, ny, nz];
            const uv: [number, number] = [0, 0];
            // Compute UVs
            uv[0] = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
            uv[1] = 0.5 - Math.asin(ny) / Math.PI;

            if (uv[0] < 0) uv[0] += 1;
            vertices.push({ position: vertex, normal: normal, uv: uv });
        });

        let indices: number[] = [
            0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4,
            11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3,
            8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
        ];

        const midpointCache = new Map<string, number>();

        const getMidpoint = (a: number, b: number): number => {
            const key = a < b ? `${a}_${b}` : `${b}_${a}`;
            if (midpointCache.has(key)) {
                return midpointCache.get(key)!;
            }

            const v1 = vertices[a].position;
            const v2 = vertices[b].position;

            const mx = (v1[0] + v2[0]) / 2;
            const my = (v1[1] + v2[1]) / 2;
            const mz = (v1[2] + v2[2]) / 2;

            const length = Math.sqrt(mx * mx + my * my + mz * mz);
            const nx = mx / length;
            const ny = my / length;
            const nz = mz / length;

            const normal: [number, number, number] = [nx, ny, nz];
            const vertex: [number, number, number] = [nx, ny, nz];

            const uv: [number, number] = [
                0.5 + Math.atan2(nz, nx) / (2 * Math.PI),
                0.5 - Math.asin(Math.min(1, Math.max(-1, ny))) / Math.PI 
            ];

            const newIndex = vertices.length;

            vertices.push({ position: vertex, normal: normal, uv: uv });

            midpointCache.set(key, newIndex);
            return newIndex;
        };

        for (let i = 0; i < subdivisions; i++) {
            const newIndices: number[] = [];
            for (let j = 0; j < indices.length; j += 3) {
                const a = indices[j];
                const b = indices[j + 1];
                const c = indices[j + 2];

                const ab = getMidpoint(a, b);
                const bc = getMidpoint(b, c);
                const ca = getMidpoint(c, a);

                newIndices.push(a, ab, ca, ab, b, bc, bc, c, ca, ab, bc, ca);
            }
            indices = [];
            indices.push(...newIndices);
        }
        const flatVertices: number[] = [];
        for (const v of vertices) {
            const uv = v.uv;
            if (webgl) {
                uv[1] = 1 - uv[1];
            }
            flatVertices.push(...v.position, ...v.normal, ...uv);
        }

        this.vertices = new Float32Array(flatVertices);
        this.indices = new Uint32Array(indices);
    }
}
