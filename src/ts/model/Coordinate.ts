import { SGF_LETTERS } from "../consts";

import { Point } from "../lib/Point";

export class Coordinate extends Point {
    constructor(x?: number, y?: number) {
        if (x !== undefined) {
            if (y == undefined) {
                const xstr = x.toString().toLowerCase();
                x = SGF_LETTERS.indexOf(xstr.substr(0, 1));
                y = SGF_LETTERS.indexOf(xstr.substr(1));
            }
        } else {
            x = 0;
            y = 0;
        }
        super(x, y);
    }

    LetterFor(s: string) {
        return SGF_LETTERS.indexOf(s)
    }

    ToString(): string {
        return SGF_LETTERS[this.x] + SGF_LETTERS[this.y];
    }

    Copy(): Coordinate {
        return new Coordinate(this.x, this.y);
    }

    static FromSGF(coord: string) {
        const loweredCoord = coord.toLowerCase();
        const x = SGF_LETTERS.indexOf(loweredCoord.substr(0, 1));
        const y = SGF_LETTERS.indexOf(loweredCoord.substr(1));
        return new Coordinate(x, y);
    }
}
