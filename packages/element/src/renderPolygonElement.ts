
import { CROP_POLYGON } from "@excalidraw/common";
import type {
  ExcalidrawImageElement,
  ExcalidrawRectangleElement
} from "./types";

import type {
  StaticCanvasAppState
} from "@excalidraw/excalidraw/types";


// 解析百分比坐标为实际坐标
const parsePercentagePoint = (
  percentageStr: string, 
  width: number, 
  height: number
): [number, number] => {
  const [xPercent, yPercent] = percentageStr.split(' ').map(p => 
    parseFloat(p.replace('%', '')) / 100
  );
  return [xPercent * width, yPercent * height];
};
// 解析 polygon 路径
const parsePolygonPath = (polygonValue: string, width: number, height: number) => {
  const pointsMatch = polygonValue.match(/polygon\(([^)]+)\)/);
  if (!pointsMatch) return [];
  
  const pointsStr = pointsMatch[1];
  const points = pointsStr.split(',').map(point => 
    parsePercentagePoint(point.trim(), width, height)
  );
  
  return points;
};
export const applyCropPolygon = (
  context: CanvasRenderingContext2D,
  element: ExcalidrawImageElement | ExcalidrawRectangleElement,
  appState: StaticCanvasAppState,
):boolean => {
  // 只对支持裁剪的元素类型应用裁剪
  if (!element.cropPolygon || 
      (element.type !== 'image' && element.type !== 'rectangle')) {
    return false;
  }
  const cropConfig  = CROP_POLYGON[element?.cropPolygon];

  if (!cropConfig) return false;
  const { width, height, x, y } = element;
  

  try {
    context.beginPath();
    
    switch (cropConfig.type) {
      case 'rectangle':
        // 矩形裁剪（默认行为，不需要额外处理）
        // context.rect(x + appState.scrollX, y + appState.scrollY, width, height);
        return true;
        // break;
        
      case 'ellipse':
        // 椭圆/圆形裁剪
        const centerX = width / 2;
        const centerY = height / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;
        context.ellipse(x + appState.scrollX + centerX, y + appState.scrollY + centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

        if (element.strokeWidth > 0) {
          context.save();
          context.strokeStyle = element.strokeColor;
          context.lineWidth = element.strokeWidth;
          context.stroke();
          context.restore();
        }
        break;
        
      case 'polygon':
        // 多边形裁剪
        const points = parsePolygonPath(cropConfig.value, width, height);
        if (points.length > 0) {
          const [startX, startY] = points[0];
          context.moveTo(
            x + appState.scrollX + startX, 
            y + appState.scrollY + startY
          );
          
          for (let i = 1; i < points.length; i++) {
            const [pointX, pointY] = points[i];
            context.lineTo(
              x + appState.scrollX + pointX, 
              y + appState.scrollY + pointY
            );
          }
          context.closePath();

          if (element.strokeWidth) {
            context.save();
            context.strokeStyle = element.strokeColor;
            context.lineWidth = element.strokeWidth;
            context.stroke();
            context.restore();
            
            // 重新开始路径用于裁剪
            context.beginPath();
            context.moveTo(x + appState.scrollX + startX, y + appState.scrollY + startY);
            for (let i = 1; i < points.length; i++) {
              const [pointX, pointY] = points[i];
              context.lineTo(x + appState.scrollX + pointX, y + appState.scrollY + pointY);
            }
            context.closePath();
          }
        }
        break;
    }
    
    // 应用裁剪
    context.clip();
    return true;
    
  } catch (error) {
    console.error('应用裁剪失败:', error);
    return false;
  }
}