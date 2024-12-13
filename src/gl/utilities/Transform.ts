import { mat4, quat, vec3 } from "gl-matrix";

export class Transform {
    position: vec3 = [0, 0, 0];
    eulerRotation: vec3 = [0, 0, 0];
    scale: vec3 = [1, 1, 1];

    GetMatrix(): mat4 {
        const scaleMatrix = mat4.create();
        mat4.fromScaling(scaleMatrix, this.scale);
        const rotation = quat.create();
        quat.fromEuler(
            rotation,
            this.eulerRotation[0],
            this.eulerRotation[1],
            this.eulerRotation[2]
        );
        const rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, rotation);

        const translationMatrix = mat4.create();
        mat4.fromTranslation(translationMatrix, this.position);


        //mat4.fromTranslation(matrix, this.position);
        return mat4.mul(mat4.create(), mat4.mul(mat4.create(), scaleMatrix,rotationMatrix), translationMatrix);
    }
}
