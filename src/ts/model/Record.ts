import { Board } from "./Board";
import { Node } from "./Node";
import { Coordinate } from "./Coordinate";

export class Record {
    board: Board;
    root: Node;
    current: Node;
    info: any;

    constructor(width: number, height?: number) {
        this.board = new Board(width, height ? height : width);
        this.root = null;
        this.current = null;
        this.info = {};
    }

    CreateNode(clearParentMarks: boolean, options?: any) {
        const node = new Node(this.board, this.current, options);

        if (clearParentMarks) {
            node.ClearParentMarks();
        }

        if (this.root == null) {
            this.root = node;
        }

        return (this.current = node);
    }

    Next(variation?: number) {
        if (this.current === null) {
            return null;
        }

        if (!variation) {
            variation = 0;
        }

        if (variation >= this.current.children.length) {
            return null;
        }

        this.current = this.current.children[variation];
        this.current.Apply();

        return this.current;
    }

    Previous() {
        if (this.current === null || this.current.parent === null) {
            return null;
        }

        this.current.Revert();
        this.current = this.current.parent;

        return this.current;
    }

    GetVariation() {
        if (this.current === null || this.current.parent === null) {
            return 0;
        }

        return this.current.parent.children.indexOf(this.current);
    }

    SetVariation(variation: number) {
        if (this.Previous() === null) {
            return null;
        }
        return this.Next(variation);
    }

    GetVariations() {
        if (this.current === null || this.current.parent === null) {
            return 1;
        }

        return this.current.parent.children.length;
    }

    GetVariationCoords(): Coordinate[] {
        const coords = [];
        for (let child of this.current.children) {
            for (let change of child.changes) {
                if (change.stone) {
                    coords.push(change.coord);
                }
            }
        }
        return coords;
    }

    First() {
        this.board.Clear();

        if (this.root !== null) {
            this.root.Apply();
        }

        this.current = this.root;
        return this.root;
    }

    Last() {
        let current = this.current;
        while (current.children.length > 0) {
            current = current.children[0];
            current.Apply();
        }
        this.current = current;
        return this.current;
    }
}
