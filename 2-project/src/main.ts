import * as script from './script';
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

const fileInput = document.getElementById('file-input') as HTMLInputElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const clearButton = document.getElementById('clear') as HTMLButtonElement;
const saveJPEGButton = document.getElementById('save-jpeg') as HTMLButtonElement;
const qualitySlider = document.getElementById('quality') as HTMLInputElement;
const qualityLabel = document.getElementById('quality-label') as HTMLSpanElement;

fileInput.addEventListener('change', (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.ppm')) {
    script.handlePPMFile(file, canvas, ctx); 
  } else if (fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
    script.handleJPEGFile(file, canvas, ctx);
  } else {
    alert('Unsupported file format!');
  }
});

clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('pixel-info')!.innerHTML = '';
});


qualitySlider.addEventListener('input', () => {
  qualityLabel.innerText = qualitySlider.value;
});

saveJPEGButton.addEventListener('click', () => {
  const quality = parseInt(qualitySlider.value, 10) / 100; 

  canvas.toBlob((blob) => {
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

