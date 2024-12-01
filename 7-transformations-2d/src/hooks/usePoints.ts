import { useState } from 'react';

export interface Point {
  x: number;
  y: number;
}

export const usePoints = () => {
  const [points, setPoints] = useState<Point[]>([]);

  const addPoint = (point: Point) => {
    setPoints((prev) => [...prev, point]);
  };

  const clearPoints = () => {
    setPoints([]);
  };

  return { points, addPoint, clearPoints };
};
