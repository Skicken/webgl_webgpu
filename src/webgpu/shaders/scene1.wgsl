struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> time: f32;
@group(0) @binding(1) var<uniform> view: mat4x4<f32>;
@group(0) @binding(2) var<uniform> projection: mat4x4<f32>;

@vertex
fn vertex_main(
    @location(0) position: vec3<f32>,
    @location(1) particleMovement: vec2<f32>
) -> VertexOutput {
    var output: VertexOutput;

    let theta = time * particleMovement.x + position.y;
    let phi = time * particleMovement.y + position.z;

    let sinTheta = sin(theta);
    let cosTheta = cos(theta);
    let sinPhi = sin(phi);
    let cosPhi = cos(phi);

    let finalPosition = vec3(
        position.x * sinTheta * cosPhi, 
        position.x * sinTheta * sinPhi, 
        position.x * cosTheta          
    );

    output.color = vec4<f32>(particleMovement, 0.5, 1.0);
    output.position = projection * view * vec4<f32>(finalPosition, 1.0);

    return output;
}
@fragment
fn fragment_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
    return color;
}
