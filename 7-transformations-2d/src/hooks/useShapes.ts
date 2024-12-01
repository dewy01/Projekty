import { useState } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  points: Point[];
}

export const useShapes = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);

  const addPoint = (point: Point) => {
    setPoints((prev) => [...prev, point]);
  };

  const finalizeShape = () => {
    if (points.length > 2) {
      setShapes((prev) => [...prev, { points }]);
      setPoints([]);
    } else {
      console.warn('A shape must have at least 3 points!');
    }
  };

  const resetPoints = () => {
    setPoints([]);
  };

  const clearShapes = () => {
    setShapes([]);
  };

  const setSelectedShapeIdx = (index: number) => {
    setSelectedShapeIndex(index);
  };

  const moveShape = (shapeIndex: number,dx: number, dy: number) => {
    if (shapeIndex !== null) {
      setShapes((prev) =>
        prev.map((shape, index) =>
          index === shapeIndex
            ? {
                ...shape,
                points: shape.points.map((p) => ({
                  x: p.x + dx,
                  y: p.y + dy,
                })),
              }
            : shape
        )
      );
    }
  };

  const clearShapeIndex = () => {
    setSelectedShapeIndex(null);
  };

  const rotateShape = (shapeIndex: number, angle: number, center: Point) => {
    const rad = (angle * Math.PI) / 180;
  
    setShapes((prevShapes) =>
      prevShapes.map((shape, index) =>
        index === shapeIndex
          ? {
              ...shape,
              points: shape.points.map((point) => {
                const translatedX = point.x - center.x;
                const translatedY = point.y - center.y;
  
                return {
                  x: center.x + translatedX * Math.cos(rad) - translatedY * Math.sin(rad),
                  y: center.y + translatedX * Math.sin(rad) + translatedY * Math.cos(rad),
                };
              }),
            }
          : shape
      )
    );
  };

  const scaleShape = (shapeIndex: number, scale: number, center: Point) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape, index) =>
        index === shapeIndex
          ? {
              ...shape,
              points: shape.points.map((point) => ({
                x: point.x * scale + (1 - scale) * center.x,
                y: point.y * scale + (1 - scale) * center.y,
              })),
            }
          : shape
      )
    );
  };

  const saveShapesToFile = () => {
    const blob = new Blob([JSON.stringify(shapes)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shapes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const shapesJson = reader.result as string;
        const loadedShapes = JSON.parse(shapesJson);
        setShapes(loadedShapes);
      };
      reader.readAsText(file);
    }
  };
  

  return {
    points,
    shapes,
    selectedShapeIndex,
    addPoint,
    finalizeShape,
    resetPoints,
    clearShapes,
    setSelectedShapeIdx,
    moveShape,
    clearShapeIndex,
    rotateShape,
    scaleShape,
    saveShapesToFile,
    handleFileUpload
  };
};
