export class Point {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    Add(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }

    Sub(other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y);
    }

    Mul(other: Point): Point {
        return new Point(this.x * other.x, this.y * other.y);
    }

    Div(other: Point): Point {
        return new Point(this.x / other.x, this.y / other.y);
    }

    Eq(other: Point): boolean {
        return this.x == other.x && this.y == other.y;
    }
}
