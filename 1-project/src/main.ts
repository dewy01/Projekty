import { DrawingApp } from './drawing';
import { Circle, Line, Point, Rectangle } from './shapes';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="main">
    <div class="sidebar">
      <button id="draw-line">Draw Line</button>
      <button id="draw-rectangle">Draw Rectangle</button>
      <button id="draw-circle">Draw Circle</button>
      <button id="move">Move / Select</button>
      <button id="resize">Resize</button>
      <input type="file" id="load" />
      <button id="save">Save</button>
      <div class="inputs">
        <label>Parameters: </br> Line - x1, y1, x2, y2,</br> Rectangle - x, y, width, height,</br> Circle - x, y, radius</label>
        <input type="text" id="params" />
        <button id="modify">Modify current</button>
        <button id="create">Create</button>
      </div>
    </div>
    <div style="display:flex; flex-direction:column; gap:2rem">
      <canvas id="canvas" width="800" height="600"></canvas>
      <button id="clear">Clear</button> 
    </div>
  </div>
`;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const drawingApp = new DrawingApp(canvas);

const activateButton = (buttonId: string) => {
    document.querySelectorAll('.sidebar button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(buttonId)?.classList.add('active');
};

['line', 'rectangle', 'circle'].forEach(shape => {
    document.getElementById(`draw-${shape}`)!.addEventListener('click', () => {
        drawingApp.setShapeType(shape as 'line' | 'rectangle' | 'circle');
        activateButton(`draw-${shape}`);
    });
});

['move', 'resize'].forEach(mode => {
    document.getElementById(mode)!?.addEventListener('click', () => {
        drawingApp.setMode(mode as 'move' | 'resize');
        activateButton(mode);
    });
});

document.getElementById('save')!.addEventListener('click', () => {
    drawingApp.saveToFile();
});

document.getElementById('load')!.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files![0];
    if (file) drawingApp.loadFromFile(file);
});

document.getElementById('modify')!.addEventListener('click', () => {
    const paramsInput = (document.getElementById('params') as HTMLInputElement).value.split(',').map(Number);
    const selectedShape = drawingApp.getSelectedShape();

    if (!selectedShape) {
        alert('No shape selected. Please select a shape to modify.');
        return;
    }

    if (selectedShape instanceof Line && paramsInput.length === 4) {
        selectedShape.point1 = new Point(paramsInput[0], paramsInput[1]);
        selectedShape.point2 = new Point(paramsInput[2], paramsInput[3]);
    } else if (selectedShape instanceof Rectangle && paramsInput.length === 4) {
        selectedShape.point1 = new Point(paramsInput[0], paramsInput[1]);
        selectedShape.point2 = new Point(paramsInput[0] + paramsInput[2], paramsInput[1] + paramsInput[3]);
    } else if (selectedShape instanceof Circle && paramsInput.length === 3) {
        selectedShape.center = new Point(paramsInput[0], paramsInput[1]);
        selectedShape.radius = paramsInput[2];
    } else {
        alert(`Please provide correct parameters for ${selectedShape.getType()}.`);
        return;
    }

    drawingApp.draw();
});

document.getElementById('create')!.addEventListener('click', () => {
    const paramsInput = (document.getElementById('params') as HTMLInputElement).value.split(',').map(Number);
    drawingApp.createShapeFromInput(paramsInput);
});


document.getElementById('clear')!.addEventListener('click', () => {
  drawingApp.clearShapes(); 
  activateButton('clear'); 
});
