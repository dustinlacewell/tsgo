export function AttachCanvas(canvas: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
