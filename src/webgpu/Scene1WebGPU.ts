import { GUI } from "lil-gui";
import { Scene } from "src/interfaces/Scene";
import { GenerateParticleBuffer } from "src/shared/ParticleGenerator";

import { DisplayNoSupport, HideNoSupport } from "./NoSupport";
import ShaderSource from "./shaders/scene1.wgsl";
import { Camera } from "./utilites/Camera";

export class WebGPUScene1 implements Scene {
    constructor() {}

    gui: GUI | undefined;
    static sceneName = "Particle Sphere";
    canvas: HTMLCanvasElement;
    device: GPUDevice | undefined = undefined;
    context: GPUCanvasContext;
    renderPipeline: GPURenderPipeline;
    renderPassDescriptor: GPURenderPassDescriptor;
    camera: Camera = new Camera();

    particleCount = 10000;
    totalTime = 0;
    particleBuffer: GPUBuffer;
    viewBuffer: GPUBuffer;
    timeBuffer: GPUBuffer;
    projectionBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    webgpuIsSupported = true;

    private async initDevice() {
        if (!navigator.gpu) {
            this.webgpuIsSupported = false;
            return;
        }

        const adapter = await navigator.gpu.requestAdapter();
        console.log(adapter);
        if (!adapter) {
            this.webgpuIsSupported = false;
            return;
        }
        this.device = await adapter.requestDevice();
        if (!this.device) {
            this.webgpuIsSupported = false;
        }
    }
    async init(canvas: HTMLCanvasElement, gui: GUI | undefined) {
        this.canvas = canvas;
        this.gui = gui.addFolder(WebGPUScene1.sceneName);
        this.gui
            .add(this, "particleCount", 10000, 1e7, 10000)
            .name("Particle Count")
            .onFinishChange(() => {
                this.initScene();
            });
        await this.initDevice();
        if (!this.webgpuIsSupported) {
            DisplayNoSupport();
            return;
        }
        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.context.configure({
            device: this.device,
            format: navigator.gpu.getPreferredCanvasFormat()
        });
        this.camera.radius = 2;
        await this.initScene();
    }
    update(deltaTime: number): void {
        this.camera.update(deltaTime);
        this.totalTime += deltaTime;
    }
    render(): void {
        const device = this.device;
        if (!device || !this.webgpuIsSupported) {
            return;
        }
        device.queue.writeBuffer(this.viewBuffer, 0, this.camera.viewMatrix);
        device.queue.writeBuffer(
            this.projectionBuffer,
            0,
            this.camera.projectionMatrix
        );
        device.queue.writeBuffer(
            this.timeBuffer,
            0,
            new Float32Array([this.totalTime])
        );

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder =
            commandEncoder.beginRenderPass(this.renderPassDescriptor);
        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.particleBuffer);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.draw(this.particleCount);
        passEncoder.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }

    private async initScene() {
        if (!this.device || !this.webgpuIsSupported) {
            return;
        }
        this.totalTime = 0;
        const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
        this.renderPassDescriptor = {
            colorAttachments: [
                {
                    clearValue: clearColor,
                    loadOp: "clear" as GPULoadOp,
                    storeOp: "store" as GPUStoreOp,
                    view: this.context.getCurrentTexture().createView()
                }
            ]
        };
        const shader = this.device.createShaderModule({
            code: ShaderSource
        });
        const particleBuffer: Float32Array = GenerateParticleBuffer(
            this.particleCount
        );

        const vertexBuffers = [
            {
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x3" as GPUVertexFormat
                    },
                    {
                        shaderLocation: 1,
                        offset: 12,
                        format: "float32x2" as GPUVertexFormat
                    }
                ],
                arrayStride: 20,
                stepMode: "vertex" as GPUVertexStepMode
            }
        ];

        this.particleBuffer = this.device.createBuffer({
            size: particleBuffer.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.viewBuffer = this.device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.projectionBuffer = this.device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.timeBuffer = this.device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        });
        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.timeBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: this.viewBuffer }
                },
                {
                    binding: 2,
                    resource: { buffer: this.projectionBuffer }
                }
            ]
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });
        this.device.queue.writeBuffer(
            this.particleBuffer,
            0,
            particleBuffer,
            0,
            particleBuffer.length
        );

        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: shader,
                entryPoint: "vertex_main",
                buffers: vertexBuffers
            },
            fragment: {
                module: shader,
                entryPoint: "fragment_main",
                targets: [
                    {
                        format: navigator.gpu.getPreferredCanvasFormat()
                    }
                ]
            },
            primitive: {
                topology: "point-list" as GPUPrimitiveTopology
            },
            layout: pipelineLayout
        };
        this.renderPipeline =
            this.device.createRenderPipeline(pipelineDescriptor);
        console.log("init");
    }
    delete(): void {
        HideNoSupport();
        this.gui.destroy();
    }
}
