import { useState } from 'react';

export interface Point {
  x: number;
  y: number;
}

export const useBezier = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [draggedPoint, setDraggedPoint] = useState<number | null>(null);
  const [mode, setMode] = useState<'create' | 'modify'>('create');

  const addPoint = (point: Point) => {
    if (mode === 'create') setPoints([...points, point]);
  };

  const startDragging = (index: number) => {
    if (mode === 'modify') setDraggingPoint(index);
  };

  const dragPoint = (point: Point) => {
    if (draggingPoint !== null) {
        setDraggedPoint(draggingPoint)
        setPoints((prev) =>
            prev.map((p, i) => (i === draggingPoint ? point : p))
        );
    }
  };

  const stopDragging = () => setDraggingPoint(null);

  return {
    points,
    setPoints,
    mode,
    setMode,
    addPoint,
    draggingPoint,
    startDragging,
    dragPoint,
    stopDragging,
    draggedPoint
  };
};
