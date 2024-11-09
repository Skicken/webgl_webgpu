export type Vertex = {
    position: [number, number, number];
    normal: [number, number, number];
    uv: [number, number];
};

export const Layout = {
    vertexStride: 8 * 4,
    positionsOffset: 0,
    normalOffset: 3 * 4,
    uvOffset: 6 * 4
};
