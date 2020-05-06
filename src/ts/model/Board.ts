import { STONE, MARK } from "../consts";
import { Coordinate } from "./Coordinate";
import { Vertex } from "./Vertex";

export class Board {
    width: number;
    height: number;
    vertices: Vertex[][];

    constructor(width: number, height: number = null) {
        this.width = width;
        this.height = height ? height : width;
        this.Clear();
    }

    GetRaw() {
        return {
            width: this.width,
            height: this.height,
            verticies: this.vertices,
        };
    }

    SetRaw(raw: any) {
        this.width = raw.width;
        this.height = raw.height;
        this.vertices = raw.verticies;
    }

    Clear() {
        this.vertices = new Array(this.width);
        for (let x = 0; x < this.width; x++) {
            this.vertices[x] = new Array(this.height);
            for (let y = 0; y < this.height; y++) {
                this.vertices[x][y] = new Vertex();
            }
        }
    }

    At(x: number, y: number): Vertex {
        let point = this.vertices[x][y];
        if (!point) throw new Error('Invalid point: ' + x + ',' + y);
        return point;
    }

    ClearAt(x: number, y: number) {
        let point = this.At(x, y);
        point.Clear();
    }

    SetStone(x: number, y: number, stone: STONE) {
        let point = this.At(x, y)
        point.stone = stone;
    }

    SetMark(x: number, y: number, mark: MARK) {
        let point = this.At(x, y);
        point.mark = mark;
    }

    SetLabel(x: number, y: number, label: string) {
        let point = this.At(x, y);
        point.label = label;
    }

    Set(x: number, y: number, stone?: STONE, mark?: MARK, label?: string) {
        if (stone) this.SetStone(x, y, stone);
        if (mark) this.SetMark(x, y, mark);
        if (label) this.SetLabel(x, y, label);
    }

    ForEach(callback: (x: number, y: number, vertex: Vertex) => any) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                callback(x, y, this.At(x, y));
            }
        }
    }

    Filter(coords: Coordinate[], stoneType: STONE) {
        const ret = [];
        for (let coord of coords) {
            if (this.At(coord.x, coord.y).stone == stoneType) {
                ret.push(coord);
            }
        }
        return ret;
    };

    Contains(coords: Coordinate[], stoneType: STONE) {
        for (let coord of coords) {
            const stone = this.At(coord.x, coord.y);
            if (stone.stone == stoneType) {
                return true;
            }
        }
        return false
    };

    Neighborhood(coord: Coordinate) {
        const coordinates = [];
        const i = coord.x;
        const j = coord.y;

        if (i > 0)
            coordinates.push(new Coordinate(i - 1, j));
        if (i + 1 < this.width)
            coordinates.push(new Coordinate(i + 1, j));
        if (j > 0)
            coordinates.push(new Coordinate(i, j - 1));
        if (j + 1 < this.height)
            coordinates.push(new Coordinate(i, j + 1));

        return coordinates;
    }

    GroupAt(coord: Coordinate, overrideType?: STONE) {
        const target = this.At(coord.x, coord.y);
        const stoneType = overrideType !== null ? overrideType : target.stone;
        const seen = {};
        const group = [coord.Copy()];
        const neighbors = [];
        let queue = this.Neighborhood(coord);

        seen[coord.ToString()] = true;

        while (queue.length) {
            const currentCoord = queue.shift();
            const currentVertex = this.At(currentCoord.x, currentCoord.y);

            if (currentCoord.ToString() in seen)
                continue; // seen already
            else
                seen[currentCoord.ToString()] = true; // seen now

            if (currentVertex.stone == stoneType) { // check if type is correct
                group.push(currentCoord);
                queue = queue.concat(this.Neighborhood(currentCoord)); // add prospects
            } else
                neighbors.push(currentCoord);
        }

        return { group: group, neighbors: neighbors };
    };

    Consider(coord: Coordinate, stone: STONE, ko?: Coordinate) {
        const oppType = stone == STONE.BLACK ? STONE.WHITE : STONE.BLACK;
        let captures = [];
        const captured = {};

        if (!coord) // pass
            return { success: true, captures: [], ko: false };

        if (this.At(coord.x, coord.y).stone != STONE.EMPTY)
            return {
                success: false,
                errorMsg: 'Cannot play on existing stone!'
            };

        if (ko && coord.Eq(ko))
            return {
                success: false,
                errorMsg: 'Cannot retake ko immediately!'
            };

        const adjacent = this.Neighborhood(coord); // find adjacent coordinates

        for (let i = 0; i < adjacent.length; i++) {
            const neighborCoord = adjacent[i];
            if (neighborCoord.ToString() in captured) continue; // avoid double capture
            const neighbor = this.At(neighborCoord.x, neighborCoord.y);

            if (neighbor.stone == oppType) { // potential capture
                var currentGroup = this.GroupAt(neighborCoord);

                if (this.Filter(currentGroup.neighbors, STONE.EMPTY).length === 1) {
                    captures = captures.concat(currentGroup.group);
                    // save captured coordinates so we don't capture them twice
                    for (var j = 0; j < currentGroup.group.length; j++)
                        captured[currentGroup.group[j].ToString()] = true;
                }
            }
        }

        // Suicide not allowed
        const group = this.GroupAt(coord, stone);
        if (captures.length === 0 &&
            !this.Contains(group.neighbors, STONE.EMPTY))
            return {
                success: false,
                errorMsg: 'Suicide is not allowed!'
            };

        // Check for ko. Note that captures were not removed so there should
        // be zero liberties around this stone in case of a ko. Also, if the
        // adjacent intersections contain stones of same color, it is not ko.
        if (captures.length == 1
            && this.Filter(adjacent, STONE.EMPTY).length === 0
            && this.Filter(adjacent, stone).length === 0
        ) {
            return { success: true, captures: captures, ko: captures[0].copy() };
        }

        return { success: true, captures: captures, ko: false };
    }
}
