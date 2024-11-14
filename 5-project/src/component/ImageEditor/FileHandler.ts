import * as jpeg from 'jpeg-js';
import { CanvasHandler } from './CanvasHandler';


export class FileHandler {
  private canvasHandler: CanvasHandler;

  constructor(canvasHandler: CanvasHandler) {
    this.canvasHandler = canvasHandler;
  }

  handleFile(file: File) {
    const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
      this.handleJPEGFile(file);
    } else {
      alert('Unsupported file format!');
    }
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


}
