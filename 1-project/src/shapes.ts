export class Point {
    constructor(public x: number, public y: number) {}

    static distance(p1: Point, p2: Point): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    static bresenham(p1: Point, p2: Point): Point[] {
        const points: Point[] = [];
        let x1 = p1.x;
        let y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = (x1 < x2) ? 1 : -1;
        let sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            points.push(new Point(x1, y1));

            if (x1 === x2 && y1 === y2) break;

            let err2 = err * 2;
            if (err2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (err2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
        return points;
    }
}

export class Line {
    constructor(public id: number, public point1: Point, public point2: Point) {}

    draw(ctx: CanvasRenderingContext2D) {
        this.ownDraw(ctx);
    }

    ownDraw(ctx: CanvasRenderingContext2D) {
        const points = Point.bresenham(this.point1, this.point2);
        ctx.beginPath();
        for (const point of points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    getResizePoint(point: Point): Point | null {
        const d1 = Point.distance(point, this.point1);
        const d2 = Point.distance(point, this.point2);
        const tolerance = 5;
        if (d1 <= tolerance) return this.point1;
        if (d2 <= tolerance) return this.point2;
        return null;
    }

    contains(point: Point): boolean {
        const d1 = Point.distance(point, this.point1);
        const d2 = Point.distance(point, this.point2);
        const lineLength = Point.distance(this.point1, this.point2);
        return d1 + d2 <= lineLength + 5;
    }

    getType(): string {
        return 'line';
    }
}

export class Rectangle {
    constructor(public id: number, public point1: Point, public point2: Point) {}

    draw(ctx: CanvasRenderingContext2D) {
        this.ownDraw(ctx);
    }

    ownDraw(ctx: CanvasRenderingContext2D) {
        const p1 = this.point1;
        const p2 = new Point(this.point2.x, this.point1.y);
        const p3 = this.point2;
        const p4 = new Point(this.point1.x, this.point2.y);

        const topEdge = Point.bresenham(p1, p2);
        const rightEdge = Point.bresenham(p2, p3);
        const bottomEdge = Point.bresenham(p3, p4);
        const leftEdge = Point.bresenham(p4, p1);

        ctx.beginPath();
        [topEdge, rightEdge, bottomEdge, leftEdge].forEach(edge => {
            for (const point of edge) {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();    
        ctx.stroke();
    }

    getResizePoint(point: Point): Point | null {
        const tolerance = 5;
        const d1 = Point.distance(point, this.point1);
        const d2 = Point.distance(point, this.point2);
        if (d1 <= tolerance) return this.point1;
        if (d2 <= tolerance) return this.point2;
        return null;
    }

    contains(point: Point): boolean {
        const xMin = Math.min(this.point1.x, this.point2.x);
        const xMax = Math.max(this.point1.x, this.point2.x);
        const yMin = Math.min(this.point1.y, this.point2.y);
        const yMax = Math.max(this.point1.y, this.point2.y);
        return point.x >= xMin && point.x <= xMax && point.y >= yMin && point.y <= yMax;
    }

    getType(): string {
        return 'rectangle';
    }
}

export class Circle {
    constructor(public id: number, public center: Point, public radius: number) {}

    draw(ctx: CanvasRenderingContext2D) {
        this.ownDraw(ctx);
    }

    ownDraw(ctx: CanvasRenderingContext2D) {
        const points = this.bresenhamCircle(this.center, this.radius);
        points.sort((a, b) => {
            const angleA = Math.atan2(a.y - this.center.y, a.x - this.center.x);
            const angleB = Math.atan2(b.y - this.center.y, b.x - this.center.x);
            return angleA - angleB;
        });
        ctx.beginPath();
        for (const point of points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.stroke(); 
    }

    private bresenhamCircle(center: Point, radius: number): Point[] {
        const points: Point[] = [];
        let x = 0;
        let y = radius;
        let d = 3 - 2 * radius;

        const addCirclePoints = (cx: number, cy: number, x: number, y: number) => {
            points.push(new Point(cx + x, cy + y));
            points.push(new Point(cx - x, cy + y));
            points.push(new Point(cx + x, cy - y));
            points.push(new Point(cx - x, cy - y)); 
            points.push(new Point(cx + y, cy + x));
            points.push(new Point(cx - y, cy + x));
            points.push(new Point(cx + y, cy - x));
            points.push(new Point(cx - y, cy - x));
        };

        while (y >= x) {
            addCirclePoints(center.x, center.y, x, y);
            x++;
            if (d > 0) {
                y--;
                d = d + 4 * (x - y) + 10;
            } else {
                d = d + 4 * x + 6;
            }
        }

        return points;
    }

    getResizePoint(point: Point): Point | null {
        const distanceFromCenter = Point.distance(point, this.center);
        const tolerance = 5;
        if (Math.abs(distanceFromCenter - this.radius) <= tolerance) {
            return new Point(point.x, point.y);
        }
        return null;
    }

    contains(point: Point): boolean {
        return Point.distance(point, this.center) <= this.radius;
    }

    getType(): string {
        return 'circle';
    }
}
