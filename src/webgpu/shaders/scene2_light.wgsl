struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
    @location(1) uv: vec2<f32>,
}

@group(0) @binding(0) var<uniform> view: mat4x4<f32>;
@group(0) @binding(1) var<uniform> projection: mat4x4<f32>;
@group(1) @binding(0) var<uniform> model: mat4x4<f32>;

@vertex
fn vertex_main(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
) -> VertexOutput {
    var output: VertexOutput;

    output.position = projection * view * model * vec4<f32>(position, 1.0);
    output.uv = uv;
    output.normal = normal;

    return output;
}

@group(1) @binding(1) var<uniform> color: vec3<f32>;
@fragment
fn fragment_main(@location(0) normal: vec3<f32>, @location(1) uv: vec2<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(color, 1.0);
}
