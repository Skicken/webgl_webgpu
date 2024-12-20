import { mat4, vec3 } from "gl-matrix";
export class GlShader {
    program: WebGLProgram;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    gl: WebGLRenderingContext;
    isValid = true;
    uniformMap: Map<string, WebGLUniformLocation> = new Map<
        string,
        WebGLUniformLocation
    >();

    constructor(
        gl: WebGLRenderingContext,
        vertexShaderText: string,
        fragmentShaderText: string
    ) {
        this.gl = gl;
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(this.vertexShader, vertexShaderText);
        gl.shaderSource(this.fragmentShader, fragmentShaderText);

        gl.compileShader(this.vertexShader);
        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            console.error(
                "ERROR compiling vertex shader!",
                gl.getShaderInfoLog(this.vertexShader)
            );
            this.isValid = false;
            return;
        }
        gl.compileShader(this.fragmentShader);
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            console.error(
                "ERROR compiling fragment shader!",
                gl.getShaderInfoLog(this.fragmentShader)
            );
            this.isValid = false;
            return;
        }

        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error(
                "ERROR linking program!",
                gl.getProgramInfoLog(this.program)
            );
            this.isValid = false;
            return;
        }
        gl.validateProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.VALIDATE_STATUS)) {
            console.error(
                "ERROR validating program!",
                gl.getProgramInfoLog(this.program)
            );
            this.isValid = false;
            return;
        }
        this.uniformMap = new Map<string, WebGLUniformLocation>();
    }
    Bind() {
        this.gl.useProgram(this.program);
    }
    GetUniformLocation(name: string): WebGLUniformLocation {
        if (this.uniformMap.has(name)) {
            return this.uniformMap.get(name);
        }
        const location: WebGLUniformLocation = this.gl.getUniformLocation(
            this.program,
            name
        );
        this.uniformMap.set(name, location);
        return location;
    }
    SetUniform1f(name: string, value: number) {
        this.gl.uniform1f(this.GetUniformLocation(name), value);
    }
    SetUniform1i(name: string, value: number) {
        this.gl.uniform1i(this.GetUniformLocation(name), value);
    }
    SetUniformMatrix(name: string, matrix: mat4) {
        this.gl.uniformMatrix4fv(this.GetUniformLocation(name), false, matrix);
    }
    SetUniform3fv(name: string, position: vec3) {
        this.gl.uniform3fv(this.GetUniformLocation(name), position);
    }
}
