import * as jpeg from 'jpeg-js';
import { CanvasHandler } from './canvasHandler';

export class FileHandler {
  private canvasHandler: CanvasHandler;

  constructor(canvasHandler: CanvasHandler) {
    this.canvasHandler = canvasHandler;
  }

  handleFile(file: File) {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.ppm')) {
      this.handlePPMFile(file);
    } else if (fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
      this.handleJPEGFile(file);
    } else {
      alert('Unsupported file format!');
    }
  }

  private handlePPMFile(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const fileType = result.split('\n')[0];
      if (fileType === 'P3') {
        this.parsePPM_P3(result);
      } else if (fileType === 'P6') {
        const binaryReader = new FileReader();
        binaryReader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          this.parsePPM_P6(arrayBuffer);
        };
        binaryReader.readAsArrayBuffer(file);
      } else {
        alert('Unsupported PPM format!');
      }
    };
    reader.readAsText(file);
  }

  private parsePPM_P3(data: string) {
    const lines = data.split('\n').map(this.clearLine).filter(line => line.trim() !== '');
    const parsedData: string[] = [];

    for (const line of lines) {
      if (line) {
        parsedData.push(...line.split(' ').filter(Boolean));
      }
    }

    const width = parseInt(parsedData[1], 10);
    const height = parseInt(parsedData[2], 10);
    const maxVal = parseInt(parsedData[3], 10);
    const pixelValues = parsedData.slice(4).map(Number);

    const pixels: number[] = [];
    for (let i = 0; i < pixelValues.length; i++) {
      if (!isNaN(pixelValues[i])) {
        pixels.push(this.convertMaxVal(pixelValues[i], maxVal));
      }
    }

    this.canvasHandler.drawImageFromPixels(pixels, width, height);
  }

  private parsePPM_P6(buffer: ArrayBuffer) {
    const dataView = new DataView(buffer);
    let offset = { value: 0 };
    let magicNumber = '';
    while (true) {
      const char = String.fromCharCode(dataView.getUint8(offset.value));
      offset.value++;
      if (char === '\n') break;
      magicNumber += char;
    }

    if (magicNumber !== 'P6') {
      alert('Invalid PPM file! Expected P6 format.');
      return;
    }

    this.clearP6Line(dataView, offset, buffer);
    const headerParts: string[] = [];

    while (headerParts.length < 3) {
      let value = '';
      let char;
      while (offset.value < buffer.byteLength) {
        char = String.fromCharCode(dataView.getUint8(offset.value));
        if (char === ' ' || char === '\n') {
          if (value.length > 0) {
            headerParts.push(value.trim());
            value = '';
            if (char === '\n') break;
          }
          offset.value++;
          this.clearP6Line(dataView, offset, buffer);
        } else {
          value += char;
          offset.value++;
        }
      }
    }

    const width = parseInt(headerParts[0], 10);
    const height = parseInt(headerParts[1], 10);
    const maxVal = parseInt(headerParts[2], 10);

    const pixels: number[] = [];
    for (let i = offset.value; i < buffer.byteLength; i += 3) {
      if (i + 2 < buffer.byteLength) {
        pixels.push(dataView.getUint8(i));
        pixels.push(dataView.getUint8(i + 1));
        pixels.push(dataView.getUint8(i + 2));
      }
    }

    const convertedPixels = pixels.map(value => this.convertMaxVal(value, maxVal));
    this.canvasHandler.drawImageFromPixels(convertedPixels, width, height);
  }

  private handleJPEGFile(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const decodedImage = jpeg.decode(arrayBuffer, { useTArray: true });

      this.canvasHandler.drawJPEGImage(decodedImage.width, decodedImage.height, decodedImage.data);
    };
    reader.readAsArrayBuffer(file);
  }

  private clearLine(line: string): string {
    if (line.trim().startsWith('#')) {
      return '';
    }
    const cleanLine = line.split('#')[0].trim();
    return cleanLine.replace(/\s+/g, ' ');
  }

  private clearP6Line(dataView: DataView, offset: { value: number }, buffer: ArrayBuffer): void {
    while (true) {
      const char = dataView.getUint8(offset.value);
      if (char === 35) {
        while (dataView.getUint8(offset.value) !== 10 && offset.value < buffer.byteLength) {
          offset.value++;
        }
      } else {
        return;
      }
    }
  }

  private convertMaxVal(value: number, maxVal: number) {
    if (maxVal > 255) {
      return Math.floor((value / maxVal) * 255);
    }
    return value;
  }
}
