import { observe } from "rxjs-observe";

import { Board } from '../model/Board';
import { Record } from '../model/Record';
import { Reader } from '../model/Reader';
import { Renderer } from '../view/Renderer';
import { ClickHandler } from "./ClickHandler";
import { HoverHandler } from "./HoverHandler";
import { ControlsHandler } from "./ControlsHandler";
import { CommentsHandler } from "./CommentsHandler";
import { CanvasOptions } from "../options/CanvasOptions";
import { BoardOptions } from "../options/BoardOptions";
import { UxOptions } from "../options/UxOptions";
import { CanvasEvent, CanvasEventSource } from "./CanvasEventSource";
import { BoundedEventSource } from "./BoundedEventSource";
import { BoardEventSource } from "./BoardEventSource";


export class TSGo {

    record: Record;
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    comments: Element;
    clickHandler: ClickHandler;
    hoverHandler: HoverHandler;
    controlsHandler: ControlsHandler;
    commentsHandler: CommentsHandler;
    hoverSource: CanvasEventSource;
    boundedSource: BoundedEventSource;
    boardSource: BoardEventSource;

    get board(): Board {
        return this.record.board;
    }

    constructor(
        boardOptions: BoardOptions,
        canvasOptions: CanvasOptions,
        uxOptions: UxOptions
    ) {
        this.record = this.SetupRecord(boardOptions);
        this.renderer = this.SetupRenderer(canvasOptions);
        this.clickHandler = new ClickHandler(this);
        this.hoverHandler = new HoverHandler(this);
        this.controlsHandler = new ControlsHandler(this, uxOptions);
        this.commentsHandler = new CommentsHandler(this, uxOptions.comments);
        this.hoverSource = new CanvasEventSource(this);
        this.boundedSource = new BoundedEventSource(
            this.hoverSource.Listen(CanvasEvent.HOVER), {
                left: this.renderer.geo.left,
                right: this.renderer.geo.right,
                top: this.renderer.geo.top,
                bottom: this.renderer.geo.bottom,
            });


        this.boardSource = new BoardEventSource(this.boundedSource, this.renderer.geo.vertexSize);
        this.boardSource.Entered().subscribe(_ => console.log("Entered"));
        this.boardSource.Exited().subscribe(_ => console.log("Exited"));
        this.Render();
    }

    SetupRenderer(opts: CanvasOptions) {
        return new Renderer({
            canvas: opts.canvas,
            width: opts.size,
            boardSize: this.record.board.width,
            invertColors: opts.invert,
            background: opts.background,
        });
    }

    SetupRecord(boardOptions: BoardOptions) {
        const record = boardOptions.sgf
            ? Reader.FromSGF(boardOptions.sgf)
            : new Record(boardOptions.size || 9);

        var { observables, proxy } = observe(record);

        observables.current.subscribe(this.Render.bind(this));

        return proxy;
    }

    Render() {
        if (!this.renderer) return;
        this.renderer.renderAll(this.record);
        this.commentsHandler.SetComments();
    }

}

export function GetSGF(filename: string, callback: (sgf: string) => void) {
    var client = new XMLHttpRequest();
    client.open('GET', filename);
    client.onreadystatechange = function() {
        if (client.readyState === XMLHttpRequest.DONE) {
            callback(client.responseText);
        }
    }
    client.send();
}
