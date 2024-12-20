import { RenderableObject } from "src/interfaces/RenderableObject";

export class RenderableObjectWebGPU {
    data: RenderableObject;

    buffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    modelBuffer: GPUBuffer;

    sampler: GPUSampler;
    albedoTexture: GPUTexture;
    roughnessTexture: GPUTexture;
    metalnessTexture: GPUTexture;
    ambientOcclusionTexture: GPUTexture;
    normalTexture: GPUTexture;
    emmisiveTexture: GPUTexture;

    constructor(
        device: GPUDevice,
        renderable: RenderableObject,
        layout: GPUBindGroupLayout
    ) {
        this.data = renderable;

        this.buffer = device.createBuffer({
            size: this.data.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        this.indexBuffer = device.createBuffer({
            size: this.data.indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.modelBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(
            this.modelBuffer,
            0,
            new Float32Array(this.data.model)
        );
        device.queue.writeBuffer(
            this.buffer,
            0,
            this.data.vertices,
            0,
            this.data.vertices.length
        );
        device.queue.writeBuffer(
            this.indexBuffer,
            0,
            this.data.indices,
            0,
            this.data.indices.length
        );

        const albedoBitmap = renderable.material.map.image;
        const roughnessBitmap = renderable.material.roughnessMap.image;
        const emmisiveBitmap = renderable.material.emissiveMap.image;
        const normalBitmap = renderable.material.normalMap.image;
        const metalnessBitmap = renderable.material.metalnessMap.image;
        const aoBitmap = renderable.material.aoMap.image;

        const setTexture = (bitmap: ImageBitmap): GPUTexture => {
            const texture = device.createTexture({
                size: [bitmap.width, bitmap.height],
                format: "rgba8unorm",
                usage:
                    GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
            });
            device.queue.copyExternalImageToTexture(
                { source: bitmap },
                { texture: texture },
                [bitmap.width, bitmap.height]
            );
            return texture;
        };
        this.albedoTexture = setTexture(albedoBitmap);
        this.roughnessTexture = setTexture(roughnessBitmap);
        this.emmisiveTexture = setTexture(emmisiveBitmap);
        this.normalTexture = setTexture(normalBitmap);
        this.metalnessTexture = setTexture(metalnessBitmap);
        this.ambientOcclusionTexture = setTexture(aoBitmap);

        this.sampler = device.createSampler({
            magFilter: "linear",
            minFilter: "linear"
        });

        this.bindGroup = device.createBindGroup({
            layout: layout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.modelBuffer }
                },
                {
                    binding: 1,
                    resource: this.sampler
                },
                {
                    binding: 2,
                    resource: this.albedoTexture.createView()
                },
                {
                    binding: 3,
                    resource: this.roughnessTexture.createView()
                },
                {
                    binding: 4,
                    resource: this.emmisiveTexture.createView()
                },
                {
                    binding: 5,
                    resource: this.normalTexture.createView()
                },
                {
                    binding: 6,
                    resource: this.metalnessTexture.createView()
                },
                {
                    binding: 7,
                    resource: this.ambientOcclusionTexture.createView()
                }
            ]
        });
    }
}
