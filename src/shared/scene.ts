import GUI from "lil-gui";

export interface Scene {
    init(canvas: HTMLCanvasElement, gui: GUI | undefined): void ;
    update(deltaTime: number): void;
    render(): void;
    delete(): void;
}


