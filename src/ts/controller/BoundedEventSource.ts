import { Observable } from "rxjs";
import { Coordinate } from "../model/Coordinate";
import { Region } from "../model/Region";
import { filter, map, pairwise, pluck } from "rxjs/operators";


export class BoundedEventSource {

    region: Region;

    constructor(private observable: Observable<Coordinate>, extents: {
        left: number, right: number, top: number, bottom: number,
    }) {
        this.region = new Region(
            extents.left,
            extents.right,
            extents.top,
            extents.bottom);
    }

    InBounds() {
        return this.observable.pipe(
            filter((coord => this.region.ContainsCoord(coord)).bind(this))
        )
    }

    LocalCoords() {
        return this.InBounds()
            .pipe(map(coord => new Coordinate(
                coord.x - this.region.left,
                coord.y - this.region.top)));
    }

    Entered() {
        return this.observable.pipe(
            pairwise(),
            filter(v =>
                !this.region.ContainsCoord(v[0]) && this.region.ContainsCoord(v[1])),
            pluck('1')
        )
    }

    Exited() {
        return this.observable.pipe(
            pairwise(),
            filter(v =>
                this.region.ContainsCoord(v[0]) && !this.region.ContainsCoord(v[1])),
            pluck('1')
        )
    }
}
