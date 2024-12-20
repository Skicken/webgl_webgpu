import { GUI } from "lil-gui";

export interface Scene {
    gui: GUI | undefined;
    init(canvas: HTMLCanvasElement, gui: GUI | undefined): Promise<void>;
    update(deltaTime: number): void;
    render(): void;
    delete(): void;
}
