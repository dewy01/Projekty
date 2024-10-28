import * as jpeg from 'jpeg-js';
import { CanvasHandler } from './CanvasHandler';


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
      const content = event.target?.result as string;
      const magicNumber = this.getMagicNumber(content);
      
      if (magicNumber === 'P3') {
        this.readPPM_P3(file);
      } else if (magicNumber === 'P6') {
        this.readPPM_P6(file);
      } else {
        alert('Unsupported PPM format!');
      }
    };
    reader.readAsText(file.slice(0, 100)); 
  }

  private readPPM_P3(file: File) {
    let textBuffer = '';

    const reader = new FileReader();
    const chunkSize = 64 * 1024; 
    let offset = 0;

    reader.onload = (event) => {
      const chunk = event.target?.result as string;
      textBuffer += chunk; 

      offset += chunkSize;
      if (offset < file.size) {
        readNextChunk();
      } else {
        this.parsePPM_P3(textBuffer);
      }
    };

    function readNextChunk() {
      const blob = file.slice(offset, offset + chunkSize);
      reader.readAsText(blob);
    }

    readNextChunk(); 
  }

  private readPPM_P6(file: File) {
    const binaryBuffer: Uint8Array[] = [];
    const reader = new FileReader();
    const chunkSize = 64 * 1024; 
    let offset = 0;

    reader.onload = (event) => {
      const chunk = event.target?.result as ArrayBuffer;
      binaryBuffer.push(new Uint8Array(chunk));

      offset += chunkSize;
      if (offset < file.size) {
        readNextChunk();
      } else {
        const completeBuffer = new Uint8Array(binaryBuffer.reduce((acc, curr) => acc + curr.length, 0));
        let position = 0;
        for (const arr of binaryBuffer) {
          completeBuffer.set(arr, position);
          position += arr.length;
        }
        this.parsePPM_P6(completeBuffer.buffer);
      }
    };

    function readNextChunk() {
      const blob = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(blob); 
    }

    readNextChunk(); 
  }

  private getMagicNumber(buffer: string): string {
    return buffer.split('\n')[0].trim();
  }

  private parsePPM_P3(data: string) {
    const lines = data.split('\n').map(this.clearLine).filter(line => line.trim() !== '');
    const parsedData: string[] = [];

    for (const line of lines) {
      if (line) {
        parsedData.push(...line.split(' ').filter(Boolean));
      }
    }

    if (parsedData.length < 4) {
      alert('Invalid P3 file: insufficient header data.');
      return;
    }

    const width = parseInt(parsedData[1], 10);
    const height = parseInt(parsedData[2], 10);
    const maxVal = parseInt(parsedData[3], 10);
    const pixelValues = parsedData.slice(4).map(Number);

    if (pixelValues.length < width * height * 3) {
      alert('Invalid P3 file: insufficient pixel data.');
      return;
    }

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
    let offset = 0;

    const magicNumber = this.readString(dataView, offset, 2);
    offset += 2;

    if (magicNumber !== 'P6') {
      alert('Invalid PPM file! Expected P6 format.');
      return;
    }

    let width = 0, height = 0, maxValue = 0;
    let headerComplete = false;

    while (!headerComplete && offset < buffer.byteLength) {
      let line = this.readLine(dataView, offset);
      offset += line.length + 1;

      line = this.removeComments(line);

      const tokens = line.split(/\s+/).filter(Boolean);

      for (const token of tokens) {
        const value = parseInt(token, 10);
        if (!isNaN(value)) {
          if (width === 0) width = value;
          else if (height === 0) height = value;
          else if (maxValue === 0) {
            maxValue = value;
            headerComplete = true;
            break;
          }
        }
      }
    }

    if (width <= 0 || height <= 0 || maxValue !== 255) {
      alert('Invalid PPM file: invalid width, height, or max value.');
      return;
    }

    const dataSize = width * height * 3;
    if (buffer.byteLength - offset < dataSize) {
      alert('Invalid PPM file: insufficient pixel data.');
      return;
    }

    const allPixels = new Uint8Array(dataSize);

    for (let i = 0; i < dataSize; i++) {
      allPixels[i] = dataView.getUint8(offset + i);
    }

    this.canvasHandler.drawImageFromPixels([...allPixels], width, height);
  }

  private readLine(dataView: DataView, offset: number): string {
    let result = '';
    while (offset < dataView.byteLength) {
      const char = String.fromCharCode(dataView.getUint8(offset));
      if (char === '\n') break; 
      result += char;
      offset++;
    }
    return result;
  }

  private removeComments(line: string): string {
    const commentIndex = line.indexOf('#');
    return commentIndex === -1 ? line : line.substring(0, commentIndex).trim();
  }

  private readString(dataView: DataView, offset: number, length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(dataView.getUint8(offset + i));
    }
    return result;
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

  private convertMaxVal(value: number, maxVal: number) {
    if (maxVal > 255) {
      return Math.floor((value / maxVal) * 255);
    }
    return value;
  }
}
