import { Circle, Line, Point, Rectangle } from './shapes';

export class DrawingApp {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private shapes: (Line | Rectangle | Circle)[] = [];
    private currentShape: Line | Rectangle | Circle | null = null;
    private isDragging: boolean = false;
    private selectedShape: Line | Rectangle | Circle | null = null;
    private startPoint: Point | null = null;
    private shapeType: 'line' | 'rectangle' | 'circle' = 'line';
    private mode: 'draw' | 'move' | 'resize' = 'draw';

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
    }

    public setShapeType(type: 'line' | 'rectangle' | 'circle') {
        this.shapeType = type;
        this.mode = 'draw';
    }

    public getSelectedShape() {
        return this.selectedShape;
    }

    public getShapeType() {
        return this.shapeType;
    }

    public setMode(mode: 'move' | 'resize') {
        this.mode = mode;
    }

    public draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const shape of this.shapes) {
            shape.draw(this.ctx);
        }
        if (this.currentShape) {
            this.currentShape.draw(this.ctx);
        }
    }

    private onMouseDown(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const point: Point = new Point(
            event.clientX - rect.left,
            event.clientY - rect.top,
        );

        if (this.mode === 'move' || this.mode === 'resize') {
            this.selectedShape = this.shapes.find(shape => shape.contains(point)) || null;
            if (this.selectedShape) {
                this.isDragging = true;
                this.startPoint = point;
            }
            return;
        }

        this.createShape(point);
    }

    private createShape(point: Point) {
        if (this.shapeType === 'line') {
            this.currentShape = new Line(Date.now(), point, point);  
        } else if (this.shapeType === 'rectangle') {
            this.currentShape = new Rectangle(Date.now(), point, point);  
        } else if (this.shapeType === 'circle') {
            this.currentShape = new Circle(Date.now(), point, 0);  
        }
    
        this.startPoint = point;
        this.draw(); 
    }
    

    private onMouseMove(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const point: Point = new Point(
            event.clientX - rect.left,
            event.clientY - rect.top,
        );

        if (this.isDragging && this.selectedShape) {
            this.handleDragging(point);
            return;
        }

        if (!this.currentShape) return;

        this.updateCurrentShape(point);
        this.draw();
    }

    private handleDragging(point: Point) {
        const dx = point.x - this.startPoint!.x;
        const dy = point.y - this.startPoint!.y;
    
        if (this.mode === 'move') {
            this.moveShape(dx, dy);
        } else if (this.mode === 'resize') {
            this.resizeShape(dx, dy);
        }
    
        this.startPoint = point;
        this.draw();
    }

    private moveShape(dx: number, dy: number) {
        if (this.selectedShape instanceof Circle) {
            this.selectedShape.center.x += dx;
            this.selectedShape.center.y += dy;
        }else{
            if (this.selectedShape instanceof Rectangle ||this.selectedShape instanceof Line ) {
                this.selectedShape.point1.x += dx;
                this.selectedShape.point1.y += dy;
                this.selectedShape.point2.x += dx;
                this.selectedShape.point2.y += dy;
       
        }
    }
    }

    private resizeShape(dx: number, dy: number) {
        if (this.selectedShape instanceof Rectangle) {
            this.selectedShape.point2.x += dx;
            this.selectedShape.point2.y += dy;
        } else if (this.selectedShape instanceof Circle) {
          
            this.selectedShape.radius = Math.abs(this.selectedShape.radius + dx);
        } else if (this.selectedShape instanceof Line) {
            this.selectedShape.point2.x += dx; 
            this.selectedShape.point2.y += dy; 
        }
    }

    private updateCurrentShape(point: Point) {
        if (this.currentShape instanceof Line) {
            this.currentShape.point1 = point;  
        } else if (this.currentShape instanceof Rectangle) {
            this.currentShape.point2 = point;  
        } else if (this.currentShape instanceof Circle) {
            this.currentShape.radius = Point.distance(this.currentShape.center, point);  
        }
    }


    private onMouseUp() {
        this.isDragging = false;

        if (this.currentShape) {
            this.shapes.push(this.currentShape);
            this.currentShape = null;  
        }
        this.draw();  
    }

    private onDoubleClick(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const point: Point = new Point(
            event.clientX - rect.left,
            event.clientY - rect.top,
        );

        this.selectedShape = this.shapes.find(shape => shape.contains(point)) || null;
        this.draw();
    }

    public saveToFile() {
        const json = JSON.stringify(this.shapes.map(shape => ({
            id: shape.id,
            type: shape.getType(),
            params: shape instanceof Line 
                ? [shape.point1.x, shape.point1.y, shape.point2.x, shape.point2.y]
                : shape instanceof Rectangle 
                ? [shape.point1.x, shape.point1.y, shape.point2.x, shape.point2.y]
                : shape instanceof Circle 
                ? [shape.center.x, shape.center.y, shape.radius]
                : [],
        })));

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    public loadFromFile(file: File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target!.result as string);
            this.shapes = data.map((shape: any) => {
                if (shape.type === 'line') {
                    return new Line(shape.id, new Point(shape.params[0], shape.params[1]), new Point(shape.params[2], shape.params[3]));
                } else if (shape.type === 'rectangle') {
                    return new Rectangle(shape.id, new Point(shape.params[0], shape.params[1]), new Point(shape.params[2], shape.params[3]));
                } else if (shape.type === 'circle') {
                    return new Circle(shape.id, new Point(shape.params[0], shape.params[1]), shape.params[2]);
                }
                return null;
            }).filter((shape: any) => shape !== null);
            this.draw();
        };
        reader.readAsText(file);
    }
}