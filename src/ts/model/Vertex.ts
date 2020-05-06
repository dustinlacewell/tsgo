import { STONE, MARK } from "../consts";


export class Vertex {
    stone: STONE;
    mark: MARK;
    label: string;
    style: string;

    constructor() {
        this.Clear();
    }

    Clear() {
        this.stone = STONE.EMPTY;
        this.mark = MARK.NONE;
        this.label = '';
    }
}
