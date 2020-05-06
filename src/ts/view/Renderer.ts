import { STONE, MARK, COORDS } from '../consts';
import { Record } from '../model/Record';
import { Vertex } from '../model/Vertex';
import { Coordinate } from '../model/Coordinate';
import { RendererGeometry } from './RendererGeometry';

const starPoints: { [index: number]: [number, number][] } = {
    9: [[5, 5]],
    13: [[4, 4], [10, 4], [4, 10], [10, 10]],
    19: [[4, 4], [10, 4], [16, 4], [4, 10], [10, 10], [16, 10], [4, 16], [10, 16], [16, 16]]
};

const DEFAULT_BACKGROUND_COLOR = '#fff';
const MIN_FONTSIZE_PX = 12;
const THIN_CHAR_REGEXP = /[.,:;|`'!]/g;

export class Renderer {
    geo: RendererGeometry;
    mainCanvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    blackColor: string = '#000';
    whiteColor: string = '#fff';
    invertColors: boolean = false;
    gridColor?: string = null;
    randomSeed: number; // as provided in options
    bgOption: string; // as provided in options
    bgColorRgb: string;
    bgCanvasOption: HTMLCanvasElement; // as provided in options
    bgCanvas: HTMLCanvasElement;
    hoverCoord: Coordinate;

    public constructor(
        args: {
            // geometry options
            width: number,
            height?: number,
            boardSize?: number,
            extraMargin?: number,
            withCoords?: boolean,
            coordFontSize?: number,

            // display options
            canvas: HTMLCanvasElement,
            backgroundCanvas?: HTMLCanvasElement,
            background?: string,
            gridColor?: string,
            invertColors: boolean,
        }
    ) {
        this.geo = new RendererGeometry({
            width: args.width,
            height: args.height,
            boardSize: args.boardSize,
            extraMargin: args.extraMargin,
            withCoords: args.withCoords,
            coordFontSize: args.coordFontSize,
        });

        this.invertColors = args.invertColors;
        if (this.invertColors) {
            const oldBlack = this.blackColor;
            const oldWhite = this.whiteColor;
            this.blackColor = oldWhite;
            this.whiteColor = oldBlack;
        }

        this.bgCanvasOption = args.backgroundCanvas;
        this.bgOption = args.background;
        this.gridColor = args.gridColor;
        this.prepare(args.canvas);
    }

    public prepare(canvas: HTMLCanvasElement) {
        canvas.width = this.geo.width;
        canvas.height = this.geo.height;
        this.mainCanvas = canvas;
        this.prepareBackground();
    }

    RenderVariations(record: Record) {
        const vertex = new Vertex();
        vertex.style = "pink";
        const variations = record.GetVariationCoords();
        for (let i = 0; i < variations.length; i++) {
            const variation = variations[i];
            vertex.label = COORDS[i];
            this.renderAt(variation.x, variation.y, vertex);
        }
    }

    public renderAll(record: Record) {
        this.useMainCanvas();
        this.drawBackground();
        this.drawGrid();
        this.drawStarPoints();
        if (this.geo.withCoords || true) this.drawCoordinates();
        record.board.ForEach(this.renderAt.bind(this));
        this.RenderVariations(record);
    }

    public getCanvas() {
        return this.mainCanvas;
    }

    private useMainCanvas() {
        this.ctx = this.mainCanvas.getContext('2d');
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }

    /**
     * Converts coordinates from pixels to grid
     * @param x - origin 0,0 is top-left corner of the canvas
     * @param y
     * @returns [i, j] - with 0,0 as bottom-left corner of the grid
     */
    public pixelToGridCoords(x: number, y: number): [number, number] {
        const i = Math.round((x - this.geo.left) / this.geo.vertexSize);
        const j = Math.round((this.geo.bottom - y) / this.geo.vertexSize);
        return [i, j];
    }

    private prepareBackground() {
        if (this.bgCanvasOption) {
            this.bgCanvas = this.bgCanvasOption;
        } else if (!this.bgOption) {
            this.bgColorRgb = DEFAULT_BACKGROUND_COLOR;
            this.bgCanvas = null;
        } else if (this.bgOption[0] === '#' || this.bgOption.substr(0, 3).toLowerCase() === 'rgb') {
            this.bgColorRgb = this.bgOption;
            this.bgCanvas = null;
        }
    }

    private setBackgroundFillStyle() {
        if (this.bgCanvas) {
            this.ctx.fillStyle = this.ctx.createPattern(this.bgCanvas, 'repeat');
        } else {
            this.ctx.fillStyle = this.bgColorRgb;
        }
    }

    private drawBackground() {
        this.setBackgroundFillStyle();
        this.ctx.fillRect(0, 0, this.geo.width, this.geo.height);
    }


    private drawGrid() {
        this.ctx.strokeStyle = this.gridColor ? this.gridColor : this.blackColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        console.log(`GRID TOP: ${this.geo.top}`);
        for (let n = 0; n < this.geo.boardSize; n++) {
            // Vertical lines
            const x = this.geo.left + n * this.geo.vertexSize;
            this.ctx.moveTo(x, this.geo.top);
            this.ctx.lineTo(x, this.geo.bottom);
            // Horizontal lines
            let y = this.geo.top + n * this.geo.vertexSize;
            this.ctx.moveTo(this.geo.left, y);
            this.ctx.lineTo(this.geo.right, y);
        }
        this.ctx.stroke();
    }

    private drawStarPoints() {
        this.ctx.fillStyle = this.gridColor ? this.gridColor : this.blackColor;
        let points = starPoints[this.geo.boardSize];
        if (!points) return;
        for (let n = 0; n < points.length; n++) {
            let coords = points[n];
            const x = (coords[0] - 1) * this.geo.vertexSize + this.geo.left;
            const y = (coords[1] - 1) * this.geo.vertexSize + this.geo.top;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.geo.vertexSize / 9, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    private drawCoordinates() {
        this.ctx.fillStyle = this.blackColor;
        this.ctx.font = this.geo.coordSize + "px Arial";
        const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
        const distFromVertex = this.geo.stoneSize + this.geo.margin / 2;

        // Horizontal - column names
        let x = this.geo.left;
        let y1 = this.geo.top - distFromVertex;
        let y2 = this.geo.bottom + distFromVertex;
        for (let n = 0; n < this.geo.boardSize; n++) {
            this.ctx.fillText(letters[n], x, y1);
            this.ctx.fillText(letters[n], x, y2);
            x += this.geo.vertexSize;
        }

        // Vertical - row numbers
        let x1 = this.geo.left - distFromVertex;
        let x2 = this.geo.right + distFromVertex;
        let y = this.geo.top;
        for (let n = 0; n < this.geo.boardSize; n++) {
            const rowNumber = (this.geo.boardSize - n).toString();
            this.ctx.fillText(rowNumber, x1, y);
            this.ctx.fillText(rowNumber, x2, y);
            y += this.geo.vertexSize;
        }
    }

    private renderAt(i: number, j: number, vertex: Vertex) {
        const x = i * this.geo.vertexSize + this.geo.left;
        const y = this.geo.top + j * this.geo.vertexSize;

        if (vertex.stone !== STONE.EMPTY) {
            this.renderSketchStoneAt(x, y, vertex.stone, this.geo.stoneSize);
        } else if (vertex.mark || vertex.label) {
            const oldFill = this.ctx.fillStyle;
            this.ctx.fillStyle = this.bgColorRgb;
            const hr = this.geo.stoneSize * .5;
            this.ctx.fillRect(x - hr, y - hr, this.geo.stoneSize, this.geo.stoneSize);
            this.ctx.fillStyle = oldFill;
        }

        if (vertex.mark) {
            this.drawMarkAt(x, y, vertex);
        }
        if (vertex.label) {
            this.drawLabelAt(x, y, vertex, vertex.label);
        }
    }

    private renderSketchStoneAt(x: number, y: number, color: STONE, radius: number) {
        this.ctx.fillStyle = color === STONE.BLACK ? 'rgb(0,0,0)' : 'rgb(255,255,255)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.93, 0, 2 * Math.PI);
        this.ctx.fill();
        if (color === STONE.BLACK) {
            const oldStrokeStyle = this.ctx.strokeStyle;
            this.ctx.strokeStyle = color === STONE.BLACK ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.88, 0, 2 * Math.PI);
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            this.ctx.strokeStyle = oldStrokeStyle;
        }
    }

    // private renderMiniStoneAt(x: number, y: number, color: STONE) {
    //     const radius = this.geo.stoneSize * 0.4;
    //     return this.renderSketchStoneAt(x, y, color, radius);
    // }

    private prepareForDrawingOver(_: number, __: number, vertex: Vertex, _clear: boolean = false) {
        switch (vertex.stone) {
            case STONE.EMPTY:
                // if (vertex.mark !== MARK.PLUS && clear) {
                //     this.setBackgroundFillStyle();
                //     const s = this.geo.vertexSize * 0.5;
                //     this.ctx.fillRect(x - s / 2, y - s / 2, s, s);
                // }
                return this.blackColor;
            case STONE.BLACK:
                if (this.invertColors) {
                    return this.blackColor;
                } else {
                    return this.whiteColor;
                }
            case STONE.WHITE:
                if (this.invertColors) {
                    return this.whiteColor;
                } else {
                    return this.blackColor;
                }
        }
    }

    private drawMarkAt(x: number, y: number, vertex: Vertex) {
        const ctx = this.ctx;
        const size = 20;
        const half = size / 2;
        const lineWidth = 5;

        switch (vertex.mark) {
            case MARK.SQUARE:
                ctx.strokeStyle = this.prepareForDrawingOver(x, y, vertex);
                ctx.lineWidth = lineWidth;
                ctx.strokeRect(x - half, y - half, size, size);
                break;
            case MARK.CIRCLE:
                ctx.strokeStyle = this.prepareForDrawingOver(x, y, vertex);
                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                ctx.arc(x, y, half, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case MARK.STAR:
                ctx.fillStyle = this.prepareForDrawingOver(x, y, vertex);
                ctx.font = (1.5 * this.geo.fontSize) + "px Arial";
                ctx.fillText('*', x, y + this.geo.fontSize * 0.42);
                break;
            case MARK.CROSS:
                ctx.strokeStyle = this.prepareForDrawingOver(x, y, vertex);
                console.log("strokeStyle:" + ctx.strokeStyle);
                ctx.lineWidth = lineWidth;
                this.drawCrossMark(x, y, half);
                break;
            case MARK.PLUS:
                ctx.strokeStyle = this.prepareForDrawingOver(x, y, vertex);
                ctx.lineWidth = lineWidth;
                this.drawPlusMark(x, y, half);
                break;
            case MARK.TRIANGLE:
                ctx.strokeStyle = this.prepareForDrawingOver(x, y, vertex);
                ctx.lineWidth = lineWidth;
                this.drawTriangleMark(x, y, half, 1);
                break;
            default:
                console.error('Unknown mark type: ' + vertex.mark);
        }
    }

    private drawCrossMark(x: number, y: number, ray: number) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x - ray, y - ray);
        ctx.lineTo(x + ray, y + ray);
        ctx.moveTo(x + ray, y - ray);
        ctx.lineTo(x - ray, y + ray);
        ctx.stroke();
    }

    private drawPlusMark(x: number, y: number, ray: number) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x - ray, y);
        ctx.lineTo(x + ray, y);
        ctx.moveTo(x, y - ray);
        ctx.lineTo(x, y + ray);
        ctx.stroke();
    }

    private drawTriangleMark(x: number, y: number, ray: number, scaleY: number) {
        const triangleX = ray * 1.04;
        const triangleY = ray * 0.6 * scaleY;
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.moveTo(x, y + ray * scaleY);
        ctx.lineTo(x - triangleX, y - triangleY);
        ctx.lineTo(x + triangleX, y - triangleY);
        ctx.lineTo(x, y + ray * scaleY);
        ctx.lineTo(x - triangleX, y - triangleY);
        ctx.stroke();
    }

    private drawLabelAt(x: number, y: number, vertex: Vertex, label: string) {
        this.ctx.fillStyle = this.prepareForDrawingOver(x, y, vertex, true);
        if (vertex.style) this.ctx.fillStyle = vertex.style;

        const largeCharCount = label.replace(THIN_CHAR_REGEXP, '').length;
        const thinCharCount = label.length - largeCharCount;
        const estimatedWidth = largeCharCount + 0.5 * thinCharCount;
        const factor = 1.2 - 0.2 * estimatedWidth;

        const fontSize = Math.max(this.geo.fontSize * factor, MIN_FONTSIZE_PX);

        this.ctx.font = fontSize + "px Arial";

        // Most labels will not use letters going under the baseline (like "j" VS "A")
        // so we "cheat" by moving all our labels down 5%; it should look better.
        const adjustY = fontSize * 0.05;

        this.ctx.fillText(label, x, y + adjustY);
    }
}
