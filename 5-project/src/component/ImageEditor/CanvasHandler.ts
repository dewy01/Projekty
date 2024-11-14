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

    applyHistogramStretch(): void {
        if (!this.imageElement) return;
      
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
      
        let minR = 255, maxR = 0;
        let minG = 255, maxG = 0;
        let minB = 255, maxB = 0;
      
        for (let i = 0; i < data.length; i += 4) {
            minR = Math.min(minR, data[i]);
            maxR = Math.max(maxR, data[i]);
        
            minG = Math.min(minG, data[i + 1]);
            maxG = Math.max(maxG, data[i + 1]);
        
            minB = Math.min(minB, data[i + 2]);
            maxB = Math.max(maxB, data[i + 2]);
        }
      
        const rangeR = maxR - minR;
        const rangeG = maxG - minG;
        const rangeB = maxB - minB;
      
        if (rangeR === 0 || rangeG === 0 || rangeB === 0) return;
      
        for (let i = 0; i < data.length; i += 4) {
            data[i] = ((data[i] - minR) / rangeR) * 255;
            data[i + 1] = ((data[i + 1] - minG) / rangeG) * 255;
            data[i + 2] = ((data[i + 2] - minB) / rangeB) * 255;
        }
      
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyHistogramEqualization(): void {
        if (!this.imageElement) return;
    
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
    
        const histRed = new Array(256).fill(0);
        const histGreen = new Array(256).fill(0);
        const histBlue = new Array(256).fill(0);
    
        for (let i = 0; i < data.length; i += 4) {
            histRed[data[i]]++;
            histGreen[data[i + 1]]++;
            histBlue[data[i + 2]]++;
        }
    
        const cdfRed = this.calculateCDF(histRed);
        const cdfGreen = this.calculateCDF(histGreen);
        const cdfBlue = this.calculateCDF(histBlue);
    
        const cdfMinRed = cdfRed.find(val => val > 0) || 0;
        const cdfMinGreen = cdfGreen.find(val => val > 0) || 0;
        const cdfMinBlue = cdfBlue.find(val => val > 0) || 0;
    
        for (let i = 0; i < data.length; i += 4) {
            data[i] = this.equalizeValue(cdfRed[data[i]], cdfMinRed, data.length);
            data[i + 1] = this.equalizeValue(cdfGreen[data[i + 1]], cdfMinGreen, data.length);
            data[i + 2] = this.equalizeValue(cdfBlue[data[i + 2]], cdfMinBlue, data.length);
        }
    
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    private calculateCDF(hist: number[]): number[] {
        const cdf = [...hist];
        for (let i = 1; i < cdf.length; i++) {
            cdf[i] += cdf[i - 1];
        }
        return cdf;
    }
    
    private equalizeValue(cdfValue: number, cdfMin: number, totalPixels: number): number {
        return Math.round(((cdfValue - cdfMin) / (totalPixels - cdfMin)) * 255);
    }    
    

applyManualThreshold(threshold: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
  
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        const value = gray > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }
  
    this.ctx.putImageData(imageData, 0, 0);
}

applyPercentBlack(percent: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
  
    const hist = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        hist[Math.round(gray)]++;
    }
  
    const totalPixels = data.length / 4;
    let totalCount = totalPixels * (percent / 100); 
  
    let threshold = 0;
    for (let i = 0; i < 256; i++) {
        totalCount -= hist[i];
        if (totalCount <= 0) {
            threshold = i;
            break;
        }
    }
  
    this.applyManualThreshold(threshold);
}

      applyIterativeSelection(): void {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
      
        let threshold = 128, prevThreshold;
        do {
          prevThreshold = threshold;
          let belowSum = 0, aboveSum = 0;
          let belowCount = 0, aboveCount = 0;
      
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            if (gray > threshold) {
              aboveSum += gray;
              aboveCount++;
            } else {
              belowSum += gray;
              belowCount++;
            }
          }
      
          const belowMean = belowCount ? belowSum / belowCount : 0;
          const aboveMean = aboveCount ? aboveSum / aboveCount : 0;
          threshold = Math.round((belowMean + aboveMean) / 2);
        } while (Math.abs(threshold - prevThreshold) > 1);
      
        this.applyManualThreshold(threshold);
      }            
   
}
