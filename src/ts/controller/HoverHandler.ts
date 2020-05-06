import { TSGo } from "./TSGo";
import { CanvasEvent, CanvasEventSource } from "../controller/CanvasEventSource";
import { Coordinate } from "../model/Coordinate";


export class HoverHandler {

    hoverSource: CanvasEventSource;

    constructor(private tsgo: TSGo) {
        this.hoverSource = new CanvasEventSource(this.tsgo);
        this.hoverSource
            .Listen(CanvasEvent.HOVER)
            .subscribe(this.Handle.bind(this));
    }

    Handle(pos: { x: number, y: number }) {
        this.tsgo.renderer.hoverCoord = new Coordinate(pos.x, pos.y);
    }

}
