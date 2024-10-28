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

    getImage(){
        return this.imageElement
    }

    private initEventListeners() {
        this.canvas.addEventListener('wheel', this.handleZoom.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }

    drawImageFromPixels(pixels: number[], width: number, height: number) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = width;
        tempCanvas.height = height;
        const imageData = tempCtx.createImageData(width, height);

        for (let i = 0; i < pixels.length; i += 3) {
            const pixelIndex = (i / 3) * 4;
            imageData.data[pixelIndex] = pixels[i];
            imageData.data[pixelIndex + 1] = pixels[i + 1];
            imageData.data[pixelIndex + 2] = pixels[i + 2];
            imageData.data[pixelIndex + 3] = 255;
        }

        tempCtx.putImageData(imageData, 0, 0);
        const img = new Image();
        img.src = tempCanvas.toDataURL();
        img.onload = () => {
            this.imageElement = img;
            this.resetView();
            this.resizeImageToFitCanvas(); 
        };
    }

    drawJPEGImage(width: number, height: number, data: Uint8Array) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = width;
        tempCanvas.height = height;
        const imageData = tempCtx.createImageData(width, height);
        imageData.data.set(data);
        tempCtx.putImageData(imageData, 0, 0);

        const img = new Image();
        img.src = tempCanvas.toDataURL();
        img.onload = () => {
            this.imageElement = img;
            this.resetView();
            this.resizeImageToFitCanvas();
        };
    }

    clearCanvas() {
        this.imageElement = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.resetView();
    }

    private resetView() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.renderCanvas();
    }

    private handleZoom(event: WheelEvent) {
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

    private handleMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.startX = event.offsetX;
        this.startY = event.offsetY;
    }

    private handleMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;

        const deltaX = event.offsetX - this.startX;
        const deltaY = event.offsetY - this.startY;

        this.offsetX += deltaX;
        this.offsetY += deltaY;

        this.startX = event.offsetX;
        this.startY = event.offsetY;

        this.renderCanvas();
    }

    private handleMouseUp() {
        this.isDragging = false;
    }

    private renderCanvas() {
        if (!this.imageElement) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX / this.scale, this.offsetY / this.scale);
        this.ctx.drawImage(this.imageElement, 0, 0);
        this.ctx.restore();
    }

    resizeImageToFitCanvas() {
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

    getImageBoundingBox() {
        if (!this.imageElement) return { x: 0, y: 0, width: 0, height: 0 };
    
        const width = this.imageElement.width * this.scale;
        const height = this.imageElement.height * this.scale;
    
        const x = (this.canvas.width / 2 - width / 2) + this.offsetX;
        const y = (this.canvas.height / 2 - height / 2) + this.offsetY;
    
        return { x, y, width, height };
    }
    
}
