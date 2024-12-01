import { Point, Shape } from "../hooks/useShapes";

export const calculateShapeCenter = (shape: Shape): Point => {
    const xSum = shape.points.reduce((sum, point) => sum + point.x, 0);
    const ySum = shape.points.reduce((sum, point) => sum + point.y, 0);
    return {
      x: xSum / shape.points.length,
      y: ySum / shape.points.length,
    };
  };
  