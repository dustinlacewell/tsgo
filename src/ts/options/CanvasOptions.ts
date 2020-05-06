
export class CanvasOptions {
    constructor(
        public canvas: HTMLCanvasElement,
        public size: number,
        public showCoordinates?: boolean,
        public background?: string,
        public backgroundCanvas?: HTMLCanvasElement,
        public pixelRatio?: number,
        public invert?: boolean,
    ) { }
}
