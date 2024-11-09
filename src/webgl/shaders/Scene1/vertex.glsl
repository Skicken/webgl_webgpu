#version 300 es
precision highp float;
layout (location = 0) in vec3 position;
layout (location = 1) in vec2 particleMovement;

uniform float time;
uniform mat4 view;
uniform mat4 projection;
out vec4 color;

void main() {
    
    float theta = time * particleMovement.x + position.y;
    float phi = time * particleMovement.y + position.z;

    float sinTheta = sin(theta);
    float cosTheta = cos(theta);
    float sinPhi = sin(phi);
    float cosPhi = cos(phi);
    
    vec3 finalPosition = vec3(
        position.x * sinTheta * cosPhi, 
        position.x * sinTheta * sinPhi, 
        position.x * cosTheta          
    );

    color = vec4(particleMovement, 0.5, 1.0);
    gl_Position = projection * view * vec4(finalPosition, 1.0);
}
