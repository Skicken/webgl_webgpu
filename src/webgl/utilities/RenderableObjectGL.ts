import { RenderableObject } from "src/interfaces/RenderableObject";
import { Layout } from "src/meshes/Vertex";

export class RenderableObjectGL {
    renderableObject: RenderableObject;
    vao: WebGLVertexArrayObject;
    vb: WebGLBuffer;
    vi: WebGLBuffer;
    diffuse: WebGLTexture;
    emissive: WebGLTexture;
    roughness: WebGLTexture;
    normal: WebGLTexture;
    metalness: WebGLTexture;
    ao: WebGLTexture;

    constructor(
        gl: WebGL2RenderingContext,
        renderableObject: RenderableObject
    ) {
        this.renderableObject = renderableObject;
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            renderableObject.vertices,
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
        this.vi = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vi);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            renderableObject.indices,
            gl.STATIC_DRAW
        );
        gl.bindVertexArray(null);

        const createGLTexture = (
            texture: WebGLTexture,
            bitmap: ImageBitmap
        ) => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                bitmap
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };

        this.diffuse = gl.createTexture();
        const diffuseBitmap = renderableObject.material.map.image;
        createGLTexture(this.diffuse, diffuseBitmap);

        this.roughness = gl.createTexture();
        const roughnessBitmap = renderableObject.material.roughnessMap.image;
        createGLTexture(this.roughness, roughnessBitmap);

        this.emissive = gl.createTexture();
        const emmisiveBitmap = renderableObject.material.emissiveMap.image;
        createGLTexture(this.emissive, emmisiveBitmap);

        this.normal = gl.createTexture();
        const normalBitmap = renderableObject.material.normalMap.image;
        createGLTexture(this.normal, normalBitmap);

        this.metalness = gl.createTexture();
        const metalnessBitmap = renderableObject.material.metalnessMap.image;
        createGLTexture(this.metalness, metalnessBitmap);

        this.ao = gl.createTexture();
        const aoBitmap = renderableObject.material.aoMap.image;
        createGLTexture(this.ao, aoBitmap);
    }
}
