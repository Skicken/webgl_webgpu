import { GeometryBuffer } from "src/meshes/GeometryBuffer"
import { Layout } from "src/meshes/Vertex"

export class GLGeometry
{

    vao:WebGLVertexArrayObject
    vb:WebGLBuffer
    vi:WebGLBuffer
    geometry:GeometryBuffer
    constructor(gl: WebGL2RenderingContext, geometry:GeometryBuffer) {

        this.vao = gl.createVertexArray()
        gl.bindVertexArray(this.vao)
        this.geometry = geometry;
        this.vb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            geometry.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,
            3,
            gl.FLOAT,
            false,
            Layout.vertexStride,
            Layout.positionsOffset
        );

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            3,
            gl.FLOAT,
            false,
            Layout.vertexStride,
            Layout.normalOffset
        );

        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            2,
            gl.FLOAT,
            false,
            Layout.vertexStride,
            Layout.uvOffset
        );
        this.vi = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vi)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
    }
}
