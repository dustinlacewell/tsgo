import { STONE, MARK } from "../consts";
import { Coordinate } from "./Coordinate";

export class Change {
    readonly coord: Coordinate;
    readonly oldStone?: STONE;
    readonly stone?: STONE;
    readonly oldMark?: MARK;
    readonly mark?: MARK;
    readonly oldLabel?: string;
    readonly label?: string;
    readonly style?: string;

    constructor(
        coord: Coordinate,
        options: {
            oldStone?: STONE,
            stone?: STONE,
            oldMark?: MARK,
            mark?: MARK,
            oldLabel?: string,
            label?: string,
            style?: string
        }
    ) {
        this.coord = coord;
        this.oldStone = options.oldStone;
        this.stone = options.stone;
        this.oldMark = options.oldMark;
        this.mark = options.mark;
        this.oldLabel = options.oldLabel;
        this.label = options.label;
        this.style = options.style;
    }
}
