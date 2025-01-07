import { mat4 } from "gl-matrix";
import { RenderableObject } from "src/interfaces/RenderableObject";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export const LoadScene = (url: string): Promise<RenderableObject[]> => {
    return new Promise((resolve) => {
        const loader = new GLTFLoader();
        const objects: RenderableObject[] = [];
        loader.load(url, (gltf) => {
            gltf.scene.traverse((child: THREE.Object3D) => {
                if ((child as THREE.Mesh).isMesh) {
                    const node = child as THREE.Mesh;
                    const geometry = node.geometry;
                    const renderable = new RenderableObject();

                    const position = geometry.attributes.position?.array;
                    const normal = geometry.attributes.normal?.array;
                    const uv = geometry.attributes.uv?.array;

                    
                    const index = geometry.index?.array;

                    const vertexCount = geometry.attributes.position.count;
                    const hasNormals = normal !== undefined;
                    const hasUVs = uv !== undefined;

                    const stride = 3 + (hasNormals ? 3 : 0) + (hasUVs ? 2 : 0);
                    const interleavedBuffer = new Float32Array(
                        vertexCount * stride
                    );

                    const minPos = new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                    const maxPos = new THREE.Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

                    for (let i = 0; i < vertexCount; i++) {
                        const x = position[i * 3];
                        const y = position[i * 3 + 1];
                        const z = position[i * 3 + 2];

                        minPos.x = Math.min(minPos.x, x);
                        minPos.y = Math.min(minPos.y, y);
                        minPos.z = Math.min(minPos.z, z);

                        maxPos.x = Math.max(maxPos.x, x);
                        maxPos.y = Math.max(maxPos.y, y);
                        maxPos.z = Math.max(maxPos.z, z);
                    }

                    const center = minPos.clone().add(maxPos).multiplyScalar(0.5);
                    const scale = 1 / maxPos.clone().sub(minPos).length();

                    // Compute min and max for UV normalization
                    const minUV = new THREE.Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                    const maxUV = new THREE.Vector2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

                    if (hasUVs) {
                        for (let i = 0; i < vertexCount; i++) {
                            const u = uv[i * 2];
                            const v = uv[i * 2 + 1];

                            minUV.x = Math.min(minUV.x, u);
                            minUV.y = Math.min(minUV.y, v);

                            maxUV.x = Math.max(maxUV.x, u);
                            maxUV.y = Math.max(maxUV.y, v);
                        }
                    }


                    for (let i = 0; i < vertexCount; i++) {
                        const offset = i * stride;

                        // Normalize positions
                        interleavedBuffer[offset] = (position[i * 3] - center.x) * scale;
                        interleavedBuffer[offset + 1] = (position[i * 3 + 1] - center.y) * scale;
                        interleavedBuffer[offset + 2] = (position[i * 3 + 2] - center.z) * scale;

                        if (hasNormals) {
                            // Normalize normals
                            const nx = normal[i * 3];
                            const ny = normal[i * 3 + 1];
                            const nz = normal[i * 3 + 2];
                            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
                            interleavedBuffer[offset + 3] = nx / length;
                            interleavedBuffer[offset + 4] = ny / length;
                            interleavedBuffer[offset + 5] = nz / length;
                        }

                        if (hasUVs) {
                            const uvOffset = hasNormals ? 6 : 3;
                            interleavedBuffer[offset + uvOffset] = (uv[i * 2] - minUV.x) / (maxUV.x - minUV.x);
                            interleavedBuffer[offset + uvOffset + 1] = (uv[i * 2 + 1] - minUV.y) / (maxUV.y - minUV.y);
                        }
                    }

                    const material =
                        node.material as THREE.MeshStandardMaterial;

                    renderable.vertices = interleavedBuffer;
                    renderable.indices = new Uint32Array(index);

                    renderable.hasNormals = hasNormals;
                    renderable.hasUVs = hasUVs;
                    renderable.material = material;
                    renderable.vertexCount = vertexCount;
                    objects.push(renderable);
                }
            });
            resolve(objects);
        });
    });
};
