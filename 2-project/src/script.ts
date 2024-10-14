import * as jpeg from 'jpeg-js';

function convertMaxVal(value: number, maxVal: number) {
  if (maxVal > 255) {
    return Math.floor((value / maxVal) * 255);
  }
  return value;
}

function clearLine(line: string): string {
  if (line.trim().startsWith('#')) {
      return ''; 
  }
  const cleanLine = line.split('#')[0].trim(); 
  return cleanLine.replace(/\s+/g, ' '); 
}

function clearP6Line(dataView: DataView, offset: { value: number }, buffer: ArrayBuffer): void {
  while (true) {
      const char = dataView.getUint8(offset.value);
      // ASCII for '#'
      if (char === 35) {
          while (dataView.getUint8(offset.value) !== 10 && offset.value < buffer.byteLength) { 
              offset.value++;
          }
      } else {
          return; 
      }
  }
}

export function handlePPMFile(file: File, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const result = event.target?.result as string;
    const fileType = result.split('\n')[0]
    if (fileType === 'P3') {
      parsePPM_P3(result, canvas, ctx);
    } else if (fileType === 'P6') {
      const binaryReader = new FileReader();
      binaryReader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        parsePPM_P6(arrayBuffer, canvas, ctx);
      };
      binaryReader.readAsArrayBuffer(file);
    } else {
      alert('Unsupported PPM format!');
    }
  };
  reader.readAsText(file);
}

function parsePPM_P3(data: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const lines = data.split('\n').map(clearLine).filter(line => line.trim() !== '');
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
          pixels.push(convertMaxVal(pixelValues[i], maxVal));
      }
  }

  drawImageFromPixels(pixels, width, height, canvas, ctx);
}

function parsePPM_P6(buffer: ArrayBuffer, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
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

  clearP6Line(dataView, offset, buffer); 

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
                  if (char === '\n') {
                      break;
                  }
              }
              offset.value++;
              clearP6Line(dataView, offset, buffer); 
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

  const convertedPixels = pixels.map(value => convertMaxVal(value, maxVal));

  drawImageFromPixels(convertedPixels, width, height, canvas, ctx);
}


function drawImageFromPixels(pixels: number[], width: number, height: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  canvas.width = width;
  canvas.height = height;
  
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < pixels.length; i += 3) {
    const pixelIndex = (i / 3) * 4; 
    imageData.data[pixelIndex] = pixels[i];    
    imageData.data[pixelIndex + 1] = pixels[i + 1]; 
    imageData.data[pixelIndex + 2] = pixels[i + 2]; 
    imageData.data[pixelIndex + 3] = 255; 
  }

  ctx.putImageData(imageData, 0, 0);
}

export function handleJPEGFile(file: File, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const arrayBuffer = event.target?.result as ArrayBuffer;
    const decodedImage = jpeg.decode(arrayBuffer, { useTArray: true });

    canvas.width = decodedImage.width;
    canvas.height = decodedImage.height;

    const imageData = ctx.createImageData(decodedImage.width, decodedImage.height);
    imageData.data.set(decodedImage.data);
    ctx.putImageData(imageData, 0, 0);
  };
  reader.readAsArrayBuffer(file);
}
