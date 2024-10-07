export class Point {
    constructor(public x: number, public y: number) {}

    static distance(p1: Point, p2: Point): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }
}

export class Line {
    constructor(public id: number, public point1: Point, public point2: Point) {}

    draw(ctx: CanvasRenderingContext2D) {
        this.ownDraw(ctx);
    }

    ownDraw(ctx: CanvasRenderingContext2D) {
        const points = this.bresenham(this.point1, this.point2);
        ctx.beginPath();
        for (const point of points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private bresenham(p1: Point, p2: Point): Point[] {
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
        const x = Math.min(this.point1.x, this.point2.x);
        const y = Math.min(this.point1.y, this.point2.y);
        const width = Math.abs(this.point1.x - this.point2.x);
        const height = Math.abs(this.point1.y - this.point2.y);
        ctx.strokeRect(x, y, width, height);
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
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    contains(point: Point): boolean {
        return Point.distance(point, this.center) <= this.radius;
    }

    getType(): string {
        return 'circle';
    }
}
