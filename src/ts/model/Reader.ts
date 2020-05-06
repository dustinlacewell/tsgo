import { Record } from "./Record";
import { Coordinate } from "./Coordinate";
import * as C from '../consts';
import { STONE, MARK } from '../consts';
import { Node } from "./Node";
import { parse } from "./SGF";

export class Reader {
    record: Record;

    constructor(record: Record) {
        this.record = record;
    }

    Setup(node: Node, name: string, values: any): boolean {
        const setupMap = { 'AB': STONE.BLACK, 'AW': STONE.WHITE, 'AE': STONE.EMPTY };
        const coords = this.ExplodeList(values);
        const stoneType = setupMap[name];
        for (let coord of coords) {
            node.SetStone(coord, stoneType);
        }
        return true;
    }

    ExplodeList(propValues: any): Coordinate[] {
        const coords = [];
        for (let val of propValues) {
            if (val.indexOf(':') == -1) { // single coordinate
                coords.push(new Coordinate(val));
            } else {
                const tuple = val.split(':')
                const c1 = new Coordinate(tuple[0]);
                const c2 = new Coordinate(tuple[1]);
                const coord = new Coordinate();

                for (coord.x = c1.x; coord.x <= c2.x; ++coord.x)
                    for (coord.y = c1.y; coord.y <= c2.y; ++coord.y)
                        coords.push(coord.Copy());
            }
        }

        return coords;
    }

    Move(node: Node, key: string, values: string[], moveMarks?: boolean): boolean {
        let player: STONE;

        if (key == 'B') {
            player = STONE.BLACK;
        } else if (key == 'W') {
            player = STONE.WHITE;
        }

        let coord: Coordinate = (values[0].length == 2)
            ? Coordinate.FromSGF(values[0])
            : null;

        const play = node.board.Consider(coord, player);

        if (!play.success) {
            throw new Error(play.errorMsg);
        }

        if (player == STONE.BLACK) {
            node.info.blackCaptures += play.captures.length;
        } else {
            node.info.whiteCaptures += play.captures.length;
        }

        if (moveMarks && play.ko) {
            node.SetMark(play.ko, MARK.SQUARE);
        }

        node.SetStone(coord, player);
        for (let capture of play.captures) {
            node.SetStone(capture, STONE.EMPTY);
        }
        if (moveMarks) {
            node.SetMark(coord, MARK.CIRCLE);
        }

        return play.success;
    }

    Mark(node: Node, name: string, values: any) {
        const coords = this.ExplodeList(values);
        const markType = C.MARKER_PROP_MAP[name];
        for (let coord of coords) {
            node.SetMark(coord, markType);
        }
        return true;
    }

    Comment(node: Node, values: any) {
        console.log(`Recording comment: ${values}`);
        node.info.comment = values[0];
        return true;
    }

    Handicap(node: Node, values: any) {
        node.info.handicap = values[0];
        return true;
    }

    Label(node: Node, values: any) {
        for (let value of values) {
            const tuple = value.split(':');
            const coord = Coordinate.FromSGF(tuple[0]);
            node.SetLabel(coord, tuple[1]);
        }
        return true;
    }

    Info(node: Node, name: string, values: any) {
        var field = C.INFO_PROP_MAP[name];
        node.info[field] = values[0];
        return true;
    }

    CreateSnapshot() {
        return {
            board: this.record.board.GetRaw(),
            current: this.record.current
        };
    }

    RestoreSnapshot(raw: any) {
        this.record.board.SetRaw(raw.board);
        this.record.current = raw.current;
    }

    HandleProp(node: Node, prop: string, values: string[], moveMarks: boolean) {
        if (C.SETUP_PROPS.indexOf(prop) > -1) {
            return this.Setup(node, prop, values);
        } else if (C.MOVE_PROPS.indexOf(prop) > -1) {
            return this.Move(node, prop, values, moveMarks);
        } else if (C.COMMENT_PROPS.indexOf(prop) > -1) {
            return this.Comment(node, values);
        } else if (C.LABEL_PROPS.indexOf(prop) > -1) {
            return this.Label(node, values);
        } else if (C.HANDICAP_PROPS.indexOf(prop) > -1) {
            return this.Handicap(node, values);
        } else if (C.MARKER_PROPS.indexOf(prop) > -1) {
            return this.Mark(node, prop, values);
        } else if (C.INFO_PROPS.indexOf(prop) > -1) {
            return this.Info(node, prop, values);
        }
        return true;
    }

    protected HandleVariations(variations: any[], moveMarks: boolean): boolean {
        for (let variation of variations) {
            const snapshot = this.CreateSnapshot();
            if (!this.RecurseRecord(variation, moveMarks)) {
                return false;
            }
            this.RestoreSnapshot(snapshot);
        }

        return true;
    }

    protected RecurseRecord(gameTree: any, moveMarks: boolean) {
        for (let item of gameTree.steps) {
            const node = this.record.CreateNode(true);

            for (let key in item) {
                if (!this.HandleProp(node, key, item[key], moveMarks)) {
                    throw new Error("Error while parsing node: " + key);
                }
            }
        }

        return this.HandleVariations(gameTree.vars, moveMarks);
    }

    static FromSGF(sgf: string, moveMarks?: boolean) {
        const data = parse(sgf);
        const rootSteps = data.steps;
        const settings = rootSteps[0];
        const size = settings.SZ ? parseInt(settings.SZ[0]) : 19;
        const record = new Record(size);
        const reader = new Reader(record);

        if (!reader.RecurseRecord(data, moveMarks)) {
            return null;
        }

        record.First();

        return record;
    }

}
