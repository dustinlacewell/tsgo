import { Region } from "../model/Region";

const MAX_COORD_FONTSIZE_PX = 10; // NB: coordinates have no minimum since they must align with the grid
const DEFAULT_MARGIN_PX = 15;

export class RendererGeometry {
    readonly boardSize: number;
    readonly width: number;
    readonly height: number;
    readonly extraMargin: number;
    withCoords: boolean;

    // computed
    margin: number;
    boardRegion: Region;
    coordSize: number;
    vertexSize: number;
    stoneSize: number;
    markSize: number;
    fontSize: number;

    constructor(args: {
        width: number,
        height?: number,
        boardSize?: number,
        extraMargin?: number,
        withCoords?: boolean,
        coordFontSize?: number,
    }) {
        this.width = args.width;
        this.height = args.height || this.width;
        this.boardSize = args.boardSize || 19;
        this.extraMargin = args.extraMargin || DEFAULT_MARGIN_PX;
        this.withCoords = args.withCoords === null ? true : args.withCoords;
        this.coordSize = args.coordFontSize;
        this.computeDimensions();
    }

    get left() { return this.boardRegion.left; }
    get right() { return this.boardRegion.right; }
    get top() { return this.boardRegion.top; }
    get bottom() { return this.boardRegion.bottom; }

    private computeDimensions() {
        const squareSize = Math.min(this.width, this.height);

        if (this.withCoords) {
            this.vertexSize = (squareSize - 2 * this.extraMargin) / (this.boardSize + 2);
            if (this.vertexSize > MAX_COORD_FONTSIZE_PX) {
                this.coordSize = MAX_COORD_FONTSIZE_PX;
                this.vertexSize = (squareSize - 2 * this.extraMargin - 2 * this.coordSize) / this.boardSize;
            } else {
                this.coordSize = this.vertexSize;
            }
            this.margin = this.extraMargin + this.coordSize;
        } else {
            this.vertexSize = (squareSize - 2 * this.extraMargin) / this.boardSize;
            this.margin = this.extraMargin;
        }

        this.stoneSize = this.vertexSize / 2;
        this.markSize = this.vertexSize * 0.55;
        this.fontSize = this.vertexSize * 0.8;

        const left =
            Math.round(this.margin + this.vertexSize / 2 + (this.width - squareSize) / 2);
        const top =
            Math.round(this.margin + this.vertexSize / 2 + (this.height - squareSize) / 2);
        const bottom = top + (this.boardSize - 1) * this.vertexSize;
        const right = left + (this.boardSize - 1) * this.vertexSize;

        this.boardRegion = new Region(left, right, top, bottom);
    }

}
