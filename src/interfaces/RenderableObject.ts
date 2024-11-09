import { MeshStandardMaterial } from "three";

export class RenderableObject
{
    vertexCount:number;
    vertices:Float32Array;
    indices:Uint32Array;
    hasNormals:boolean;
    hasUVs:boolean;
    material: MeshStandardMaterial;

}
