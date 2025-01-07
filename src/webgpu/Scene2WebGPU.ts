import { mat4 } from "gl-matrix";
import { GUI } from "lil-gui";
import { RenderableObject } from "src/interfaces/RenderableObject";
import { Scene } from "src/interfaces/Scene";
import { BuildObjectsGrid } from "src/utilities/BuildObjectsGrid";
import { LoadScene } from "src/utilities/GlftLoader";
import { generateLights as GenerateLights } from "src/utilities/LightsGenerator";

import { DisplayNoSupport, HideNoSupport } from "./NoSupport";
import ShaderSource from "./shaders/scene2.wgsl";
import LightShader from "./shaders/scene2_light.wgsl";
import { Camera } from "./utilites/Camera";
import { InitDevice } from "./utilites/InitDevice";
import { RenderableObjectWebGPU } from "./utilites/RenderableObjectWebGPU";
import { PointLightWebGPU } from "./utilites/WebGPUPointLight";

export class WebGPUScene2 implements Scene {
    constructor() {}

    gui: GUI | undefined;
    static sceneName = "Model Lighting";
    canvas: HTMLCanvasElement;
    device: GPUDevice | undefined = undefined;
    context: GPUCanvasContext;
    modelRenderPipeline: GPURenderPipeline;
    lightRenderPipeline: GPURenderPipeline;
    camera: Camera = new Camera();

    private models: mat4[] = [];
    renderableHelmet: RenderableObjectWebGPU;

    viewBuffer: GPUBuffer;
    projectionBuffer: GPUBuffer;
    lightBuffer: GPUBuffer;
    lightCountBuffer: GPUBuffer;
    camPositionBuffer: GPUBuffer;

    modelBindGroup: GPUBindGroup[] = [];
    bindGroup: GPUBindGroup;
    vpBindGroup: GPUBindGroup;

    depthTexture: GPUTexture;
    lightsNumber: number = 1;
    showLights: boolean = true;
    private lights: PointLightWebGPU[] = [];
    update(deltaTime: number): void {
        this.camera.update(deltaTime);
    }
    render(): void {
        const device = this.device;
        if (!device) {
            return;
        }
        device.queue.writeBuffer(this.viewBuffer, 0, this.camera.viewMatrix);
        device.queue.writeBuffer(
            this.projectionBuffer,
            0,
            this.camera.projectionMatrix
        );
        device.queue.writeBuffer(
            this.camPositionBuffer,
            0,
            new Float32Array(this.camera.position)
        );

        const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
        const renderPassDescriptor = {
            colorAttachments: [
                {
                    clearValue: clearColor,
                    loadOp: "clear" as GPULoadOp,
                    storeOp: "store" as GPUStoreOp,
                    view: this.context.getCurrentTexture().createView()
                }
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear" as GPULoadOp,
                depthStoreOp: "store" as GPUStoreOp
            }
        };
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder =
            commandEncoder.beginRenderPass(renderPassDescriptor);

        passEncoder.setPipeline(this.modelRenderPipeline);
        passEncoder.setVertexBuffer(0, this.renderableHelmet.buffer);
        passEncoder.setIndexBuffer(this.renderableHelmet.indexBuffer, "uint32");
        passEncoder.setBindGroup(0, this.vpBindGroup);
        passEncoder.setBindGroup(1, this.bindGroup);
        passEncoder.setBindGroup(2, this.renderableHelmet.bindGroup);
        for (const modelBindGroup of this.modelBindGroup) {
            passEncoder.setBindGroup(3,modelBindGroup);
            passEncoder.drawIndexed(this.renderableHelmet.data.indices.length);
        }

        if (this.showLights) {
            passEncoder.setPipeline(this.lightRenderPipeline);
            passEncoder.setVertexBuffer(0, PointLightWebGPU.geometryBuffer);
            passEncoder.setIndexBuffer(
                PointLightWebGPU.geometryIndexBuffer,
                "uint32"
            );
            passEncoder.setBindGroup(0, this.vpBindGroup);
            for (const light of this.lights) {
                passEncoder.setBindGroup(1, light.bindGroup);
                passEncoder.drawIndexed(
                    PointLightWebGPU.geometry.indices.length
                );
            }
        }

        passEncoder.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }

    async init(canvas: HTMLCanvasElement, gui: GUI | undefined) {
        this.canvas = canvas;
        this.gui = gui.addFolder(WebGPUScene2.sceneName);
        this.gui
            .add(this, "lightsNumber", 1, 256, 1)
            .name("Light number")
            .onFinishChange(() => {
                this.initScene();
            });

        this.gui
            .add(this, "showLights")
            .name("Show Lights")
            .onFinishChange(() => {
                this.initScene();
            });

        this.device = await InitDevice();
        if (!this.device) {
            DisplayNoSupport();
            return;
        }

        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.context.configure({
            device: this.device,
            format: navigator.gpu.getPreferredCanvasFormat()
        });

        this.camera.maxRadius = 5;
        this.camera.radius = 2;
        this.camera.minRadius = 1;
        this.camera.pitch = -45;
        this.camera.yaw = -45;

        await this.initScene();
    }

    private async initScene() {
        if (!this.device) {
            return;
        }

        PointLightWebGPU.initGeometry(this.device);
        const shader = this.device.createShaderModule({
            code: ShaderSource
        });

        const lightShader = this.device.createShaderModule({
            code: LightShader
        });

        this.depthTexture = this.device.createTexture({
            size: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        const lights = GenerateLights(this.lightsNumber, 2);

        const lightGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                }
            ]
        });

        this.lights = lights.map((light) => {
            return new PointLightWebGPU(this.device, light, lightGroupLayout);
        });

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
                        format: "float32x3" as GPUVertexFormat
                    },
                    {
                        shaderLocation: 2,
                        offset: 24,
                        format: "float32x2" as GPUVertexFormat
                    }
                ],
                arrayStride: 32,
                stepMode: "vertex" as GPUVertexStepMode
            }
        ];

        const renderables: RenderableObject[] = await LoadScene(
            "./assets/DamagedHelmet.glb"
        );

        const modelGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 6,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                }
            ]
        });

        const helmet = renderables[0];
        this.renderableHelmet = new RenderableObjectWebGPU(
            this.device,
            helmet,
            modelGroupLayout
        );

        this.viewBuffer = this.device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.device.queue.writeBuffer(
            this.viewBuffer,
            0,
            this.camera.viewMatrix
        );
        this.projectionBuffer = this.device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.camPositionBuffer = this.device.createBuffer({
            size: 12,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.lightCountBuffer = this.device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const alignedLightStructSize = 32;
        this.lightBuffer = this.device.createBuffer({
            size: alignedLightStructSize * 256,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        const lightData = new Float32Array((256 * alignedLightStructSize) / 4);

        for (let i = 0; i < this.lights.length; i++) {
            const light = this.lights[i];
            const offset = (i * alignedLightStructSize) / 4;
            lightData.set(light.data.position, offset);
            lightData.set(light.data.color, offset + 4);
            lightData[offset + 7] = light.data.intensity;
        }
        this.device.queue.writeBuffer(this.lightBuffer, 0, lightData);
        this.device.queue.writeBuffer(
            this.lightCountBuffer,
            0,
            new Uint32Array([this.lightsNumber])
        );

        const vpBindGroupLayout = this.device.createBindGroupLayout({
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
                }
            ]
        });
        const lightBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                }
            ]
        });
        const modelBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        });

        this.vpBindGroup = this.device.createBindGroup({
            layout: vpBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.viewBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: this.projectionBuffer }
                }
            ]
        });

        this.bindGroup = this.device.createBindGroup({
            layout: lightBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.camPositionBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: this.lightBuffer }
                },
                {
                    binding: 2,
                    resource: { buffer: this.lightCountBuffer }
                }
            ]
        });
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                vpBindGroupLayout,
                lightBindGroupLayout,
                modelGroupLayout,
                modelBindGroupLayout
            ]
        });
        const lightPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                vpBindGroupLayout,
                lightGroupLayout,
            ]
        });

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
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth24plus"
            },
            primitive: {
                topology: "triangle-list" as GPUPrimitiveTopology
            },
            layout: pipelineLayout
        };

        const lightPipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: lightShader,
                entryPoint: "vertex_main",
                buffers: vertexBuffers
            },
            fragment: {
                module: lightShader,
                entryPoint: "fragment_main",
                targets: [
                    {
                        format: navigator.gpu.getPreferredCanvasFormat()
                    }
                ]
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth24plus"
            },
            primitive: {
                topology: "triangle-list" as GPUPrimitiveTopology
            },
            layout: lightPipelineLayout
        };
        this.modelRenderPipeline =
            this.device.createRenderPipeline(pipelineDescriptor);
        this.lightRenderPipeline = this.device.createRenderPipeline(
            lightPipelineDescriptor
        );
        this.models = BuildObjectsGrid(25, 0.6);
        for (const model of this.models) {
            const modelBuffer = this.device.createBuffer({
                size: 64,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });
            this.device.queue.writeBuffer(modelBuffer, 0, new Float32Array(model));
            this.modelBindGroup.push(
                this.device.createBindGroup({
                    layout: modelBindGroupLayout,
                    entries: [
                        {
                            binding: 0,
                            resource: { buffer: modelBuffer }
                        }
                    ]
                })
            );
        }
    }
    delete(): void {
        HideNoSupport();
        this.gui.destroy();
    }
}
