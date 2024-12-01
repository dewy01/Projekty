interface Point {
    x: number;
    y: number;
  }
  
  export const isInsideShape = (point: Point, polygonPoints: Point[]): boolean => {
    const count = polygonPoints.length;
    let inside = false;
  
    for (let i = 0, j = count - 1; i < count; j = i++) {
      const pi = polygonPoints[i];
      const pj = polygonPoints[j];
  
      if (
        (pi.y > point.y) !== (pj.y > point.y) &&
        point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x
      ) {
        inside = !inside;
      }
    }
  
    return inside;
  };
  