import { Extend } from "../utils";
import { STONE, MARK } from "../consts";
import { Board } from "./Board";
import { Change } from "./Change";
import { Coordinate } from "./Coordinate";

export class NodeInfo {
    blackCaptures: number;
    whiteCaptures: number;
    comment: string;
    handicap: number;
}


export class Node {
    board: Board;
    parent: Node;
    children: Node[];
    changes: Change[];
    info: NodeInfo;

    constructor(board: Board, parent?: Node, info?: NodeInfo) {
        this.board = board;
        this.parent = parent;
        this.children = [];
        this.changes = [];
        this.info = info ? Extend({}, info) : {};

        if (parent) {
            parent.children.push(this);
            this.info.blackCaptures = parent.info.blackCaptures;
            this.info.whiteCaptures = parent.info.whiteCaptures;
        } else {
            this.info.blackCaptures = 0;
            this.info.whiteCaptures = 0;
        }
    }

    ClearParentMarks() {
        if (!this.parent) return;

        for (let i = this.parent.changes.length - 1; i >= 0; i--) {
            const change = this.parent.changes[i];

            if (change.mark) {
                this.SetMark(change.coord, MARK.NONE);
            }
        }
    }

    SetStone(coord: Coordinate, stone: STONE) {
        const old = this.board.At(coord.x, coord.y);
        const change = new Change(coord, { oldStone: old.stone, stone: stone });
        this.changes.push(change);
        this.board.SetStone(coord.x, coord.y, stone);
    }

    SetMark(coord: Coordinate, mark: MARK) {
        const old = this.board.At(coord.x, coord.y);
        const change = new Change(coord, { oldMark: old.mark, mark: mark });
        this.changes.push(change);
        this.board.SetMark(coord.x, coord.y, mark);
    }

    SetLabel(coord: Coordinate, label: string) {
        const old = this.board.At(coord.x, coord.y);
        const change = new Change(coord, { oldLabel: old.label, label: label })
        this.changes.push(change)
        this.board.SetLabel(coord.x, coord.y, label);
    }

    Apply() {
        for (let change of this.changes) {
            if (change.stone) {
                this.board.SetStone(change.coord.x, change.coord.y, change.stone);
            } else if (change.mark) {
                this.board.SetMark(change.coord.x, change.coord.y, change.mark);
            } else if (change.label) {
                this.board.SetLabel(change.coord.x, change.coord.y, change.label);
            }
        }
    }

    Revert() {
        for (let change of this.changes) {
            if (change.stone) {
                this.board.SetStone(change.coord.x, change.coord.y, change.oldStone);
            } else if (change.mark) {
                this.board.SetMark(change.coord.x, change.coord.y, change.oldMark);
            } else if (change.label) {
                this.board.SetLabel(change.coord.x, change.coord.y, change.oldLabel);
            }
        }
    }
}
