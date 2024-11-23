import { mat4, quat, vec3 } from "gl-matrix";

export class Transform {
    position: vec3 = [0, 0, 0];
    eulerRotation: vec3 = [0, 0, 0];
    scale: vec3 = [1, 1, 1];

    GetMatrix(): mat4 {
        const matrix = mat4.create();
        mat4.fromScaling(matrix, this.scale);
        const rotation = quat.create();
        const rotationMatrix = mat4.create();
        quat.fromEuler(
            rotation,
            this.eulerRotation[0],
            this.eulerRotation[1],
            this.eulerRotation[2]
        );
        mat4.fromQuat(matrix, rotation);
        return matrix;
    }
}
