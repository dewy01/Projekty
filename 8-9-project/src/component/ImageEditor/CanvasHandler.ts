export class CanvasHandler {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private scale: number = 1;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private isDragging: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private imageElement: HTMLImageElement | null = null;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.initEventListeners();
    }

    getImage(): HTMLImageElement | null {
        return this.imageElement;
    }

    private initEventListeners(): void {
        this.canvas.addEventListener('wheel', this.handleZoom.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }

    drawJPEGImage(width: number, height: number, data: Uint8Array): void {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
    
        tempCanvas.width = width;
        tempCanvas.height = height;
        const imageData = tempCtx.createImageData(width, height);
        imageData.data.set(data);
        tempCtx.putImageData(imageData, 0, 0);
    
        const img = new Image();
        img.src = tempCanvas.toDataURL('image/jpeg', 1.0);
        img.onload = () => {
            this.imageElement = img;
            this.resetView();
            this.resizeImageToFitCanvas();
            this.renderCanvas();
        };
    }
    

    clearCanvas(): void {
        this.imageElement = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.resetView();
    }

    private resetView(): void {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.renderCanvas();
    }

    private handleZoom(event: WheelEvent): void {
        event.preventDefault();
        const zoomFactor = 1.05;
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        const prevMouseXInImage = (mouseX - this.offsetX) / this.scale;
        const prevMouseYInImage = (mouseY - this.offsetY) / this.scale;

        if (event.deltaY < 0) {
            this.scale *= zoomFactor;  
        } else {
            this.scale /= zoomFactor; 
        }

        this.offsetX = mouseX - prevMouseXInImage * this.scale;
        this.offsetY = mouseY - prevMouseYInImage * this.scale;

        this.renderCanvas();
    }

    private handleMouseDown(event: MouseEvent): void {
        this.isDragging = true;
        this.startX = event.offsetX;
        this.startY = event.offsetY;
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.isDragging) return;

        const deltaX = event.offsetX - this.startX;
        const deltaY = event.offsetY - this.startY;

        this.offsetX += deltaX;
        this.offsetY += deltaY;

        this.startX = event.offsetX;
        this.startY = event.offsetY;

        this.renderCanvas();
    }

    private handleMouseUp(): void {
        this.isDragging = false;
    }

    private renderCanvas(): void {
        if (!this.imageElement) return;
    
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    
        const sourceX = Math.max(0, -this.offsetX / this.scale);
        const sourceY = Math.max(0, -this.offsetY / this.scale);
        const sourceWidth = Math.min(
            this.imageElement.width,
            this.canvas.width / this.scale
        );
        const sourceHeight = Math.min(
            this.imageElement.height,
            this.canvas.height / this.scale
        );
    
        const destX = Math.max(0, this.offsetX);
        const destY = Math.max(0, this.offsetY);
        const destWidth = sourceWidth * this.scale;
        const destHeight = sourceHeight * this.scale;

        this.ctx.drawImage(
            this.imageElement,
            sourceX, sourceY, sourceWidth, sourceHeight, 
            destX, destY, destWidth, destHeight      
        );
    
        this.ctx.restore();
    }
    
    

    resizeImageToFitCanvas(): void {
        if (!this.imageElement) return;

        const canvasAspect = this.canvas.width / this.canvas.height;
        const imageAspect = this.imageElement.width / this.imageElement.height;

        if (imageAspect > canvasAspect) {
            this.scale = this.canvas.width / this.imageElement.width;
        } else {
            this.scale = this.canvas.height / this.imageElement.height;
        }

        this.offsetX = (this.canvas.width - this.imageElement.width * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.imageElement.height * this.scale) / 2;

        this.renderCanvas();
    }

    getImageBoundingBox(): { x: number; y: number; width: number; height: number } {
        if (!this.imageElement) return { x: 0, y: 0, width: 0, height: 0 };

        const width = this.imageElement.width * this.scale;
        const height = this.imageElement.height * this.scale;

        const x = (this.canvas.width / 2 - width / 2) + this.offsetX;
        const y = (this.canvas.height / 2 - height / 2) + this.offsetY;

        return { x, y, width, height };
    }

    public getCurrentImageDataURL(): string {
        return this.canvas.toDataURL();
    }

}
