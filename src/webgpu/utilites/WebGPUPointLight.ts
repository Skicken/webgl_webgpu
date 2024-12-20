import { PointLight } from "src/interfaces/PointLight";
import { GeometryBuffer } from "src/meshes/GeometryBuffer";
import { Icosphere } from "src/meshes/Icosphere";

export class PointLightWebGPU
{

    static geometry:GeometryBuffer = new Icosphere(2)
    static geometryBuffer:GPUBuffer;
    static geometryIndexBuffer:GPUBuffer;

    data:PointLight;
    modelBuffer:GPUBuffer;
    colorBuffer:GPUBuffer;
    bindGroup:GPUBindGroup;
    static initGeometry(device:GPUDevice)
    {

        this.geometryBuffer = device.createBuffer({
            size: this.geometry.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.geometryIndexBuffer = device.createBuffer({
            size: this.geometry.indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(
            this.geometryIndexBuffer,
            0,
            this.geometry.indices,
            0,
            this.geometry.indices.length
        );

        device.queue.writeBuffer(
            this.geometryBuffer,
            0,
            this.geometry.vertices,
            0,
            this.geometry.vertices.length
        );

    }
    constructor(device:GPUDevice, light:PointLight,lightGroupLayout:GPUBindGroupLayout)
    { 

        this.data =light;
        this.modelBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST

        });

        this.colorBuffer = device.createBuffer({
            size: 12,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });


        device.queue.writeBuffer(this.modelBuffer,0,new Float32Array(light.model));
        device.queue.writeBuffer(this.colorBuffer,0,new Float32Array(light.color));

        this.bindGroup = device.createBindGroup({
            layout: lightGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.modelBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: this.colorBuffer }
                }
            ]
        });

    }

}
