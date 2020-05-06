import { map, distinctUntilChanged } from "../../../node_modules/rxjs/operators";

import { BoundedEventSource } from "./BoundedEventSource";
import { Coordinate } from "../model/Coordinate";


export class BoardEventSource {

    constructor(
        private boundedSource: BoundedEventSource,
        private vertexSize: number) {
    }

    protected BoardCoordinate(coord: Coordinate) {
        const halfRadius = Math.floor(this.vertexSize / 2);

        let x = coord.x;
        let y = coord.y;

        x += halfRadius;
        y += halfRadius;

        x = Math.floor(x / this.vertexSize);
        y = Math.floor(y / this.vertexSize);

        return new Coordinate(x, y);
    }

    LocalCoords() {
        return this.boundedSource.LocalCoords()
            .pipe(
                map(this.BoardCoordinate.bind(this)),
                distinctUntilChanged((a: Coordinate, b: Coordinate) => a.Eq(b)));
    }

    Entered() {
        return this.boundedSource.Entered()
            .pipe(
                map(this.BoardCoordinate.bind(this)));
    }

    Exited() {
        return this.boundedSource.Exited()
            .pipe(
                map(this.BoardCoordinate.bind(this)));
    }

}
