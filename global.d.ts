declare module '*.jpg' {
  const value: string;
  export = value;
}
declare module '*.glsl' {
  const value: string;
  export = value;
}
declare module '*.wgsl' {
  const value: string;
  export = value;
}

interface HTMLCanvasElement {
  getContext(contextId: "webgpu"): GPUCanvasContext | null;
}
