import { mat4 } from 'gl-matrix';

export const BuildObjectsGrid = (numberOfObjects: number, distance: number): mat4[] => {
    const grid: mat4[] = [];
    const gridSize = Math.ceil(Math.sqrt(numberOfObjects)); 
    const halfGridSize = gridSize / 2; 

    for (let i = 0; i < numberOfObjects; i++) {
        const row = Math.floor(i / gridSize); 
        const col = i % gridSize;            

        const x = (col - halfGridSize + 0.5) * distance; 
        const z = (row - halfGridSize + 0.5) * distance; 

        
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [x, 0, z]); 
        mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 2);

        grid.push(modelMatrix);
    }

    return grid;
};
