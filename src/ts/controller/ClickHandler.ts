import { TSGo } from "./TSGo";
import { Coordinate } from "../model/Coordinate";
import { Record } from "../model/Record";
import { CanvasEvent, CanvasEventSource } from "../controller/CanvasEventSource";


export class ClickHandler {

    clickSource: CanvasEventSource;

    constructor(private tsgo: TSGo) {
        this.clickSource = new CanvasEventSource(this.tsgo);
        this.clickSource
            .Listen(CanvasEvent.CLICK)
            .subscribe(this.CheckVariations.bind(this));
    }

    private get record(): Record {
        return this.tsgo.record;
    }

    CheckVariations(coord: Coordinate) {
        for (let vari of this.record.current.children) {
            for (let change of vari.changes) {
                if (change.coord.Eq(coord)) {
                    this.record.current = vari;
                    this.record.current.Apply();
                    this.tsgo.Render();
                    return;
                }
            }
        }
    }
}
