import { DrawingApp } from './drawing';
import { Circle, Line, Point, Rectangle } from './shapes';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="main">
    <div class="sidebar">
      <button id="draw-line">Draw Line</button>
      <button id="draw-rectangle">Draw Rectangle</button>
      <button id="draw-circle">Draw Circle</button>
      <button id="move">Move</button>
      <button id="resize">Resize</button>
      <input type="file" id="load" />
      <button id="save">Save</button>
      <div>
        <label>Parameters (x1, y1, x2, y2 for Line, x, y, width, height for Rectangle, x, y, radius for Circle):</label>
        <input type="text" id="params" />
        <button id="set-params">Set Parameters</button>
      </div>
    </div>
    <div>
      <canvas id="canvas" width="800" height="600"></canvas>
    </div>
  </div>
`;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const drawingApp = new DrawingApp(canvas);

const activateButton = (buttonId: string) => {
    const buttons = document.querySelectorAll('.sidebar button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(buttonId)?.classList.add('active');
};

document.getElementById('draw-line')!.addEventListener('click', () => {
    drawingApp.setShapeType('line');
    activateButton('draw-line');
});

document.getElementById('draw-rectangle')!.addEventListener('click', () => {
    drawingApp.setShapeType('rectangle');
    activateButton('draw-rectangle');
});

document.getElementById('draw-circle')!.addEventListener('click', () => {
    drawingApp.setShapeType('circle');
    activateButton('draw-circle');
});

document.getElementById('move')!.addEventListener('click', () => {
    drawingApp.setMode('move');
    activateButton('move');
});

document.getElementById('resize')!.addEventListener('click', () => {
    drawingApp.setMode('resize');
    activateButton('resize');
});

document.getElementById('save')!.addEventListener('click', () => {
    drawingApp.saveToFile();
});

document.getElementById('load')!.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files![0];
    if (file) {
        drawingApp.loadFromFile(file);
    }
});

document.getElementById('set-params')!.addEventListener('click', () => {

    const paramsInput = (document.getElementById('params') as HTMLInputElement).value.split(',').map(Number);
    const selectedShape = drawingApp.getSelectedShape();

    if (!selectedShape) {
        alert('No shape selected. Please select a shape to modify.');
        return;
    }

    if (selectedShape instanceof Line) {
        if (paramsInput.length !== 4) {
            alert('Please provide 4 parameters: x1, y1, x2, y2 for Line.');
            return;
        }
        selectedShape.point1 = new Point(paramsInput[0], paramsInput[1]); 
        selectedShape.point2 = new Point(paramsInput[2], paramsInput[3]); 
    } else if (selectedShape instanceof Rectangle) {
        if (paramsInput.length !== 4) {
            alert('Please provide 4 parameters: x, y, width, height for Rectangle.');
            return;
        }
        selectedShape.point1 = new Point(paramsInput[0], paramsInput[1]); 
        selectedShape.point2 = new Point(paramsInput[0] + paramsInput[2], paramsInput[1] + paramsInput[3]); 
    } else if (selectedShape instanceof Circle) {
        if (paramsInput.length !== 3) {
            alert('Please provide 3 parameters: x, y, radius for Circle.');
            return;
        }
        selectedShape.center = new Point(paramsInput[0], paramsInput[1]); 
        selectedShape.radius = paramsInput[2]; 
    }

    drawingApp.draw(); 
});
