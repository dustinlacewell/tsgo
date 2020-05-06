import { fromEvent, Observable } from "../../../node_modules/rxjs";
import { map, filter, distinctUntilChanged } from "../../../node_modules/rxjs/operators";

import { TSGo } from "./TSGo";
import { Coordinate } from "../model/Coordinate";


export enum CanvasEvent {
    HOVER = 'mousemove',
    EXIT = 'mouseleave',
    CLICK = 'click',
}


export class CanvasEventSource {
    constructor(private tsgo: TSGo) { }

    Listen(event: CanvasEvent): Observable<Coordinate> {
        const canvas = this.tsgo.renderer.mainCanvas;
        return fromEvent(canvas, event)
            .pipe(this.CanvasCoordinate());
    }

    protected CanvasCoordinate() {
        return map((event: MouseEvent) => {
            const canvas = this.tsgo.renderer.mainCanvas;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            return new Coordinate(x, y);
        });
    }

}
