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

    drawImageFromPixels(pixels: number[], width: number, height: number): void {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = width;
        tempCanvas.height = height;
        const imageData = tempCtx.createImageData(width, height);

        for (let i = 0; i < pixels.length; i += 3) {
            const pixelIndex = (i / 3) * 4;
            imageData.data[pixelIndex] = pixels[i];     // R
            imageData.data[pixelIndex + 1] = pixels[i + 1]; // G
            imageData.data[pixelIndex + 2] = pixels[i + 2]; // B
            imageData.data[pixelIndex + 3] = 255;       // A
        }

        tempCtx.putImageData(imageData, 0, 0);
        const img = new Image();
        img.src = tempCanvas.toDataURL();
        img.onload = () => {
            this.imageElement = img;
            this.resetView();
            this.resizeImageToFitCanvas();
            this.renderCanvas();
        };
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
        img.src = tempCanvas.toDataURL();
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
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX / this.scale, this.offsetY / this.scale);
        this.ctx.drawImage(this.imageElement, 0, 0);
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

    public pointTransform(transformFunc: (pixel: { r: number; g: number; b: number; a: number }) => { r: number; g: number; b: number; a: number }): void {
        if (!this.imageElement) return;

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            const transformedPixel = transformFunc({ r, g, b, a });

            data[i] = transformedPixel.r;
            data[i + 1] = transformedPixel.g;
            data[i + 2] = transformedPixel.b;
            data[i + 3] = transformedPixel.a;
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    public getCurrentImageDataURL(): string {
        return this.canvas.toDataURL();
    }

public applySmoothingOrGaussianFilter(kernel: number[][]): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);

    const kernelSize = kernel.length;
    const halfSize = Math.floor(kernelSize / 2);

    // Normalize the kernel
    const kernelSum = kernel.flat().reduce((sum, value) => sum + value, 0);
    const normalizedKernel = kernel.map(row => row.map(value => value / kernelSum));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;

            for (let ky = -halfSize; ky <= halfSize; ky++) {
                for (let kx = -halfSize; kx <= halfSize; kx++) {
                    const pixelX = Math.min(width - 1, Math.max(0, x + kx));
                    const pixelY = Math.min(height - 1, Math.max(0, y + ky));
                    const pixelIndex = (pixelY * width + pixelX) * 4;

                    r += data[pixelIndex] * normalizedKernel[ky + halfSize][kx + halfSize];
                    g += data[pixelIndex + 1] * normalizedKernel[ky + halfSize][kx + halfSize];
                    b += data[pixelIndex + 2] * normalizedKernel[ky + halfSize][kx + halfSize];
                }
            }

            const newPixelIndex = (y * width + x) * 4;
            newImageData.data[newPixelIndex] = Math.min(Math.max(r, 0), 255);
            newImageData.data[newPixelIndex + 1] = Math.min(Math.max(g, 0), 255);
            newImageData.data[newPixelIndex + 2] = Math.min(Math.max(b, 0), 255);
            newImageData.data[newPixelIndex + 3] = data[newPixelIndex + 3]; 
        }
    }

    this.ctx.putImageData(newImageData, 0, 0);
}

public applyEdgeDetectionFilter(kernel: number[][]): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);

    const kernelSize = kernel.length;
    const halfSize = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sumR = 0, sumG = 0, sumB = 0;

            for (let ky = -halfSize; ky <= halfSize; ky++) {
                for (let kx = -halfSize; kx <= halfSize; kx++) {
                    const pixelX = Math.min(width - 1, Math.max(0, x + kx));
                    const pixelY = Math.min(height - 1, Math.max(0, y + ky));
                    const pixelIndex = (pixelY * width + pixelX) * 4;

                    // Get the RGB values of the neighboring pixel
                    const r = data[pixelIndex];
                    const g = data[pixelIndex + 1];
                    const b = data[pixelIndex + 2];

                    // Get the kernel weight
                    const weight = kernel[ky + halfSize][kx + halfSize];

                    // Apply the kernel weights
                    sumR += r * weight;
                    sumG += g * weight;
                    sumB += b * weight;
                }
            }

            const newPixelIndex = (y * width + x) * 4;

            // Clamp values to stay within 0-255
            newImageData.data[newPixelIndex] = Math.min(Math.max(sumR, 0), 255);
            newImageData.data[newPixelIndex + 1] = Math.min(Math.max(sumG, 0), 255);
            newImageData.data[newPixelIndex + 2] = Math.min(Math.max(sumB, 0), 255);
            newImageData.data[newPixelIndex + 3] = data[newPixelIndex + 3]; 
        }
    }

    this.ctx.putImageData(newImageData, 0, 0);
}



    public applyMedianFilter(kernelSize = 3): void {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        const result = new Uint8ClampedArray(data.length);
        const halfSize = Math.floor(kernelSize / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const neighbors: number[] = [];

                // Collect neighboring pixels within the kernel size
                for (let dy = -halfSize; dy <= halfSize; dy++) {
                    for (let dx = -halfSize; dx <= halfSize; dx++) {
                        const neighborX = Math.min(width - 1, Math.max(0, x + dx));
                        const neighborY = Math.min(height - 1, Math.max(0, y + dy));
                        const index = (neighborY * width + neighborX) * 4; // RGBA

                        // Push R, G, B values into the neighbors array
                        neighbors.push(data[index], data[index + 1], data[index + 2]);
                    }
                }

                // Get medians for R, G, B channels
                const medianR = this.median(neighbors.filter((_, i) => i % 3 === 0));
                const medianG = this.median(neighbors.filter((_, i) => i % 3 === 1));
                const medianB = this.median(neighbors.filter((_, i) => i % 3 === 2));

                const resultIndex = (y * width + x) * 4;
                result[resultIndex] = medianR;
                result[resultIndex + 1] = medianG;
                result[resultIndex + 2] = medianB;
                result[resultIndex + 3] = data[resultIndex + 3]; // Preserve alpha
            }
        }

        this.ctx.putImageData(new ImageData(result, width, height), 0, 0);
    }

    // Calculates the median of an array of values.
    private median(values: number[]): number {
        const sorted = values.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
}
