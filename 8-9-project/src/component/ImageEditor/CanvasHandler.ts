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

    private dilate(data: Uint8ClampedArray, width: number, height: number, se: number[][]): Uint8ClampedArray {
        const result = new Uint8ClampedArray(data);
        const halfSE = Math.floor(se.length / 2);
      
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let maxR = 0, maxG = 0, maxB = 0; 
            for (let i = -halfSE; i <= halfSE; i++) {
              for (let j = -halfSE; j <= halfSE; j++) {
                const ny = y + i;
                const nx = x + j;
                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                  const pixelIndex = (ny * width + nx) * 4;
                  const structValue = se[i + halfSE][j + halfSE];
                  if (structValue === 1) {
                    maxR = Math.max(maxR, data[pixelIndex]); 
                    maxG = Math.max(maxG, data[pixelIndex + 1]); 
                    maxB = Math.max(maxB, data[pixelIndex + 2]); 
                  }
                }
              }
            }
            const currentIndex = (y * width + x) * 4;
            result[currentIndex] = maxR; 
            result[currentIndex + 1] = maxG;
            result[currentIndex + 2] = maxB;
          }
        }
        return result;
      }
      
      private erode(data: Uint8ClampedArray, width: number, height: number, se: number[][]): Uint8ClampedArray {
        const result = new Uint8ClampedArray(data);
        const halfSE = Math.floor(se.length / 2);
      
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let minR = 255, minG = 255, minB = 255; 
            for (let i = -halfSE; i <= halfSE; i++) {
              for (let j = -halfSE; j <= halfSE; j++) {
                const ny = y + i;
                const nx = x + j;
                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                  const pixelIndex = (ny * width + nx) * 4;
                  const structValue = se[i + halfSE][j + halfSE];
                  if (structValue === 1) {
                    minR = Math.min(minR, data[pixelIndex]);
                    minG = Math.min(minG, data[pixelIndex + 1]); 
                    minB = Math.min(minB, data[pixelIndex + 2]); 
                  }
                }
              }
            }
            const currentIndex = (y * width + x) * 4;
            result[currentIndex] = minR; 
            result[currentIndex + 1] = minG; 
            result[currentIndex + 2] = minB; 
          }
        }
        return result;
      }
      
      private updateCanvasWithImageData(data: Uint8ClampedArray, width: number, height: number): void {
        const newImageData = new ImageData(data, width, height);
        this.ctx.putImageData(newImageData, 0, 0);
      }
      
      applyDilation() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const result = this.dilate(imageData.data, this.canvas.width, this.canvas.height, [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
        this.updateCanvasWithImageData(result, imageData.width, imageData.height);
      }
      
      applyErosion() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const result = this.erode(imageData.data, this.canvas.width, this.canvas.height, [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
        this.updateCanvasWithImageData(result, imageData.width, imageData.height);
      }
      
      applyOpening() {
        this.applyErosion();
        this.applyDilation();
      }
      
      applyClosing() {
        this.applyDilation();
        this.applyErosion();
      }
      
      applyHitOrMiss(structuringElement: (boolean | null)[][]) {
        const { width, height } = this.canvas;
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const newImageData = this.ctx.createImageData(width, height);
      
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let match = true;
      
            for (let i = 0; i < structuringElement.length; i++) {
              for (let j = 0; j < structuringElement[i].length; j++) {
                const offsetX = x + j - Math.floor(structuringElement[i].length / 2);
                const offsetY = y + i - Math.floor(structuringElement.length / 2);
      
                if (
                  offsetX >= 0 &&
                  offsetX < width &&
                  offsetY >= 0 &&
                  offsetY < height
                ) {
                  const pixelIndex = (offsetY * width + offsetX) * 4;
                  const pixelValueR = imageData.data[pixelIndex] > 128;
                  const pixelValueG = imageData.data[pixelIndex + 1] > 128;
                  const pixelValueB = imageData.data[pixelIndex + 2] > 128;
      
                  const structValue = structuringElement[i][j];
                  if (structValue === true && !(pixelValueR && pixelValueG && pixelValueB)) {
                    match = false;
                  }
                  if (structValue === false && (pixelValueR || pixelValueG || pixelValueB)) {
                    match = false;
                  }
                }
              }
            }
      
            const resultIndex = (y * width + x) * 4;
            if (match) {
              newImageData.data[resultIndex] = 255;
              newImageData.data[resultIndex + 1] = 255;
              newImageData.data[resultIndex + 2] = 255;
              newImageData.data[resultIndex + 3] = 255;
            } else {
              newImageData.data[resultIndex] = 0;
              newImageData.data[resultIndex + 1] = 0;
              newImageData.data[resultIndex + 2] = 0;
              newImageData.data[resultIndex + 3] = 255;
            }
          }
        }
      
        this.ctx.putImageData(newImageData, 0, 0);
      }
      

      public renderGreenAreas() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const greenPixelData: number[] = [];
    
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];    
          const g = data[i + 1]; 
          const b = data[i + 2]; 
    
          const threshold = 25;
          if (g > r + threshold && g > b + threshold) {
            greenPixelData.push(i);
          } else {
            data[i + 3] = 0; 
          }
        }
    
        this.ctx.putImageData(imageData, 0, 0);
    
        return greenPixelData.length / (data.length / 4) * 100;
      }
      

      
}
