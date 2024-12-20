#version 300 es
precision highp float;

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 particleMovement;

uniform float time;
uniform mat4 view;
uniform mat4 projection;
out vec4 color;


void main() {
    
    float r = position.x;
    float thetaVelocity = particleMovement.x;
    float phiVelocity = particleMovement.y;

    float theta = time * thetaVelocity + position.y;
    float phi = time * phiVelocity + position.z;


    float sinTheta = sin(theta);
    float cosTheta = cos(theta);

    float sinPhi = sin(phi);
    float cosPhi = cos(phi);


    float x = r * sinTheta * cosPhi;
    float y = r * sinTheta * sinPhi;
    float z = r * cosTheta;

    color = vec4(thetaVelocity,phiVelocity,0.5,1.0);

    vec3 finalPosition = vec3(x,y,z) ;
    gl_Position = projection * view  * vec4(finalPosition, 1.0f); 
}

