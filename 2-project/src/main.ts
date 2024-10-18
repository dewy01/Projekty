import { CanvasHandler } from './canvasHandler';
import { FileHandler } from './fileHandler';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="main">
    <div class="sidebar">
      <div class="inputs">
        <label class="file-input-button" for="file-input">Import file</label>
        <input type="file" id="file-input" accept=".ppm,.jpeg,.jpg" />
        <label for="quality">JPEG Quality: <span id="quality-label">90</span>%</label>
        <input type="range" id="quality" min="1" max="100" value="90">
        <button id="save-jpeg">Save as JPEG</button>
        <button id="clear">Clear</button>
        <button id="resize-fit">resize-fit</button>
      </div>
    </div>
    <div class="content">
      <div class="canvas-container">
        <canvas id="canvas"></canvas>
      </div>
    </div>
    <div id="pixel-info"></div>
  </div>
`;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const canvasHandler = new CanvasHandler(canvas, ctx);
const fileHandler = new FileHandler(canvasHandler);

const fileInput = document.getElementById('file-input') as HTMLInputElement;
const clearButton = document.getElementById('clear') as HTMLButtonElement;
const saveJPEGButton = document.getElementById('save-jpeg') as HTMLButtonElement;
const qualitySlider = document.getElementById('quality') as HTMLInputElement;
const qualityLabel = document.getElementById('quality-label') as HTMLSpanElement;
const resizeFitButton = document.getElementById('resize-fit') as HTMLButtonElement;

fileInput.addEventListener('change', (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) fileHandler.handleFile(file);
});

clearButton.addEventListener('click', () => {
  canvasHandler.clearCanvas();
  document.getElementById('pixel-info')!.innerHTML = '';
});

qualitySlider.addEventListener('input', () => {
  qualityLabel.innerText = qualitySlider.value;
});

saveJPEGButton.addEventListener('click', () => {
  const quality = parseInt(qualitySlider.value, 10) / 100;

  const imageElement = canvasHandler.getImage();
  if (!imageElement) return; // Ensure there's an image to save
  
  // Use the original dimensions of the image
  const { width, height } = imageElement;

  const saveCanvas = document.createElement('canvas');
  saveCanvas.width = width;
  saveCanvas.height = height;
  const saveCtx = saveCanvas.getContext('2d') as CanvasRenderingContext2D;

  // Draw the image using the image element directly
  saveCtx.drawImage(imageElement, 0, 0, width, height);

  // Convert to blob and initiate download
  saveCanvas.toBlob((blob) => {
      if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'image.jpeg';
          a.click();
          URL.revokeObjectURL(url);
      }
  }, 'image/jpeg', quality);
});



resizeFitButton.addEventListener('click', () => {
  canvasHandler.resizeImageToFitCanvas();
});