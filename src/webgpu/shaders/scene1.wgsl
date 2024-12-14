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

    let r = position.x;
    let thetaVelocity = particleMovement.x;
    let phiVelocity = particleMovement.y;

    let theta = time * thetaVelocity + position.y;
    let phi = time * phiVelocity + position.z;

    let sinTheta = sin(theta);
    let cosTheta = cos(theta);

    let sinPhi = sin(phi);
    let cosPhi = cos(phi);

    let x = r * sinTheta * cosPhi;
    let y = r * sinTheta * sinPhi;
    let z = r * cosTheta;

    output.color = vec4<f32>(thetaVelocity, phiVelocity, 0.5, 1.0);

    let finalPosition = vec3<f32>(x, y, z);
    output.position = projection * view * vec4<f32>(finalPosition, 1.0);
    
    return output;
}
@fragment
fn fragment_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
    return color;
}
