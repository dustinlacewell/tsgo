import { Coordinate } from "./Coordinate";


export class Region {
    constructor(
        public readonly left: number,
        public readonly right: number,
        public readonly top: number,
        public readonly bottom: number) { }

    ContainsCoord(coord: Coordinate): boolean {
        return (
            coord.x >= this.left &&
            coord.x <= this.right &&
            coord.y >= this.top &&
            coord.y <= this.bottom);
    }
}
