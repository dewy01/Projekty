export const rgbToCmyk = (r: number, g: number, b: number) => {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    const c = (1 - rNorm - k) / (1 - k) || 0;
    const m = (1 - gNorm - k) / (1 - k) || 0;
    const y = (1 - bNorm - k) / (1 - k) || 0;
    return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
  };
  
export const cmykToRgb = (c: number, m: number, y: number, k: number) => {
    const r = 255 * (1 - c / 100) * (1 - k / 100);
    const g = 255 * (1 - m / 100) * (1 - k / 100);
    const b = 255 * (1 - y / 100) * (1 - k / 100);
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };