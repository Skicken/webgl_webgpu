import { vec3 } from "wgpu-matrix";
import { GeometryBuffer } from "./GeometryBuffer";

export interface SphereMesh {
    vertices: Float32Array;
    indices: Uint16Array;
}

export const SphereLayout = {
    vertexStride: 8 * 4,
    positionsOffset: 0,
    normalOffset: 3 * 4,
    uvOffset: 6 * 4
};
export class Sphere extends GeometryBuffer {
    widthSegments: number;
    heightSegments: number;
    constructor(widthSegments: number, heightSegments: number, webgl = false) {
        super();
        const vertices = [];
        const indices = [];

        widthSegments = Math.max(3, Math.floor(widthSegments));
        heightSegments = Math.max(2, Math.floor(heightSegments));
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;

        const firstVertex = vec3.create();
        const vertex = vec3.create();
        const normal = vec3.create();

        let index = 0;
        const grid = [];
        const radius = 1;
        const randomness = 0;

        // generate vertices, normals and uvs
        for (let iy = 0; iy <= heightSegments; iy++) {
            const verticesRow = [];
            const v = iy / heightSegments;

            // special case for the poles
            let uOffset = 0;
            if (iy === 0) {
                uOffset = 0.5 / widthSegments;
            } else if (iy === heightSegments) {
                uOffset = -0.5 / widthSegments;
            }

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;

                // Poles should just use the same position all the way around.
                if (ix == widthSegments) {
                    vec3.copy(firstVertex, vertex);
                } else if (ix == 0 || (iy != 0 && iy !== heightSegments)) {
                    const theta = u * Math.PI * 2;
                    const phi = v * Math.PI;
                    const rr =
                        radius + Math.random() * Math.abs(phi) * randomness;
                    // vertex
                    vertex[0] = -rr * Math.cos(theta) * Math.sin(phi);
                    vertex[1] = rr * Math.cos(phi);
                    vertex[2] = rr * Math.sin(theta) * Math.sin(phi);

                    if (ix == 0) {
                        vec3.copy(vertex, firstVertex);
                    }
                }

                vertices.push(vertex[0], vertex[1], vertex[2]);

                // normal
                vec3.copy(vertex, normal);
                vec3.normalize(normal, normal);

                vertices.push(normal[0], normal[1], normal[2]);

                const ux = u + uOffset;
                const uy = webgl ? v : 1 - v;
                vertices.push(ux, uy);
                verticesRow.push(index++);
            }

            grid.push(verticesRow);
        }

        // indices
        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];

                if (iy !== 0) indices.push(a, b, d);
                if (iy !== heightSegments - 1) indices.push(b, c, d);
            }
        }

        this.vertices = new Float32Array(vertices);
        this.indices = new Uint32Array(indices);
    }
}

