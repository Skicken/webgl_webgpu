struct VertexOutput {
    @builtin(position) position: vec4<f32>, // World position in this context
    @location(0) worldPos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
};

struct PointLight {
    intensity: f32,
    position: vec3<f32>,
    color: vec3<f32>,
};
const PI: f32 = 3.14159265359;
@group(0) @binding(0) var<uniform> view: mat4x4<f32>;
@group(0) @binding(1) var<uniform> projection: mat4x4<f32>;

@group(2) @binding(0) var<uniform> model: mat4x4<f32>;
@group(2) @binding(1) var textureSampler: sampler;
@group(2) @binding(2) var albedoTexture: texture_2d<f32>;
@group(2) @binding(3) var roughnessTexture: texture_2d<f32>;
@group(2) @binding(4) var emissiveTexture: texture_2d<f32>;
@group(2) @binding(5) var normalTexture: texture_2d<f32>;
@group(2) @binding(6) var metalTexture: texture_2d<f32>;
@group(2) @binding(7) var aoTexture: texture_2d<f32>;

@group(1) @binding(0) var<uniform> camPos: vec3<f32>;
@group(1) @binding(1) var<uniform> lights: array<PointLight, 256>;
@group(1) @binding(2) var<uniform> lightsCount: i32;

fn fresnelSchlick(cosTheta: f32, F0: vec3<f32>) -> vec3<f32> {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

fn distributionGGX(N: vec3<f32>, H: vec3<f32>, roughness: f32) -> f32 {
    let a = roughness * roughness;
    let a2 = a * a;
    let NdotH = max(dot(N, H), 0.0);
    let NdotH2 = NdotH * NdotH;

    let num = a2;
    let denom = (NdotH2 * (a2 - 1.0) + 1.0);
    return num / (PI * denom * denom);
}

fn geometrySchlickGGX(NdotV: f32, roughness: f32) -> f32 {
    let r = (roughness + 1.0);
    let k = (r * r) / 8.0;

    let num = NdotV;
    let denom = NdotV * (1.0 - k) + k;

    return num / denom;
}

fn geometrySmith(N: vec3<f32>, V: vec3<f32>, L: vec3<f32>, roughness: f32) -> f32 {
    let NdotV = max(dot(N, V), 0.0);
    let NdotL = max(dot(N, L), 0.0);
    let ggx2 = geometrySchlickGGX(NdotV, roughness);
    let ggx1 = geometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

@vertex
fn vertex_main(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
) -> VertexOutput {
    var output: VertexOutput;

    output.worldPos = (model * vec4<f32>(position, 1.0)).rgb;
    output.position = projection * view * model * vec4<f32>(position, 1.0);    output.uv = uv;
    output.normal = (model * vec4<f32>(normal, 0.0)).xyz;

    return output;
}

@fragment
fn fragment_main(
    @location(0) worldPos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
) -> @location(0) vec4<f32> {
    let albedo = pow(textureSample(albedoTexture, textureSampler, uv).rgb, vec3<f32>(2.2));
    let emissive = textureSample(emissiveTexture, textureSampler, uv).rgb;
    let ao = textureSample(aoTexture, textureSampler, uv).r;
    let roughness = textureSample(roughnessTexture, textureSampler, uv).g;
    let metalness = textureSample(metalTexture, textureSampler, uv).b;
    let normalMap = normalize(textureSample(normalTexture, textureSampler, uv).rgb * 2.0 - 1.0);

    var N = normalize(normal);
    N = normalize(mix(N, normalMap, 0.1));
    let V = normalize(camPos - worldPos);

    var Lo = vec3<f32>(0.0);
    let F0 = mix(vec3<f32>(0.04), albedo, metalness);

    for (var i = 0; i < min(lightsCount, 256); i = i + 1) {
        let light = lights[i];
        let L = normalize(light.position - worldPos);
        let H = normalize(V + L);
        let distance = length(light.position - worldPos);
        let attenuation = 1.0 / (distance * distance + 0.001);
        let radiance = light.color * light.intensity * attenuation;

        let NDF = distributionGGX(N, H, roughness);
        let G = geometrySmith(N, V, L, roughness);
        let F = fresnelSchlick(max(dot(H, V), 0.0), F0);

        var kS = F;
        var kD = vec3<f32>(1.0) - kS;
        kD *= 1.0 - metalness;

        let numerator = NDF * G * F;
        let denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
        let specular = numerator / denominator;

        let NdotL = max(dot(N, L), 0.0);
        Lo += (kD * albedo / PI + specular) * radiance * NdotL;
    }

    let ambient = vec3<f32>(0.04) * albedo * ao;
    let color = ambient + emissive + Lo;

    return vec4<f32>(pow(color / (color + vec3<f32>(1.0)), vec3<f32>(1.0 / 2.2)), 1.0);
}


