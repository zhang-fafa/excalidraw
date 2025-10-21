
import { CROP_POLYGON, ROUGHNESS } from "@excalidraw/common";
import type {
  ExcalidrawImageElement,
  ExcalidrawRectangleElement
} from "./types";

import type {
  StaticCanvasAppState
} from "@excalidraw/excalidraw/types";

import { generateRoughOptions } from "./shape";
import rough from "roughjs/bin/rough";
import { getCornerRadius } from "./utils";

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

const drawSlightlyRoughEllipse = (
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  roughness: number
) => {
  const numPoints = Math.max(32, Math.floor((radiusX + radiusY) / 2));
  const roughnessFactor = Math.min(roughness, 1) * 0.5; // 限制roughness影响
  
  context.beginPath();
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    
    // 基础椭圆坐标
    const baseX = centerX + radiusX * Math.cos(angle);
    const baseY = centerY + radiusY * Math.sin(angle);
    
    // 使用种子保证一致性的随机偏移
    const seed = Math.sin(angle * 7) + Math.cos(angle * 5);
    const offsetX = seed * roughnessFactor;
    const offsetY = seed * roughnessFactor * 0.8;
    
    const x = baseX + offsetX;
    const y = baseY + offsetY;
    
    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  
  context.closePath();
  context.stroke();
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

        if (element.strokeWidth > 0 && element.type !== "image") {
          context.save();

          // 根据roughness级别选择绘制策略
          const isArtisticStyle = element.roughness >= ROUGHNESS.cartoonist;
          if (isArtisticStyle) {
            // 艺术/漫画家风格 - 使用RoughJS绘制
            context.restore(); // 先恢复context状态
            
            // 创建临时元素配置用于RoughJS
            const ellipseElement = {
              ...element,
              type: 'ellipse' as const,
              backgroundColor: 'transparent',
              fillStyle: 'solid' as const,
              // 保持原始roughness，不使用adjustRoughness调整
              roughness: element.roughness
            };
            
            // 使用完整的RoughJS生成选项
            const roughOptions = generateRoughOptions(ellipseElement);
            
            // 确保只绘制边框
            roughOptions.fill = undefined;
            roughOptions.fillStyle = undefined;
            
            // 针对艺术风格的特殊配置
            if (element.roughness >= ROUGHNESS.cartoonist) {
              // 漫画家风格 - 保持顶点，增强手绘感
              roughOptions.preserveVertices = false;
              roughOptions.disableMultiStroke = false;
              // 增加曲线拟合度以获得更自然的椭圆
              roughOptions.curveFitting = 1;
              roughOptions.curveStepCount = 9;
            }
            
            const generator = rough.generator();
            const ellipseShape = generator.ellipse(
              centerX, 
              centerY, 
              radiusX * 2, 
              radiusY * 2, 
              roughOptions
            );
            
            // 绘制艺术风格椭圆
            context.save();
            context.translate(x + appState.scrollX , y + appState.scrollY);
            
            const rc = rough.canvas(context.canvas);
            rc.draw(ellipseShape);
            
            context.restore();
            
          } else {
            // 标准风格 - 使用原生Canvas绘制
            context.strokeStyle = element.strokeColor;
            context.lineWidth = element.strokeWidth;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            // 设置虚线样式
            switch (element.strokeStyle) {
              case 'dashed':
                const dashArray = [8, 8 + element.strokeWidth];
                context.setLineDash(dashArray);
                break;
                
              case 'dotted':
                const dotArray = [1.5, 6 + element.strokeWidth];
                context.setLineDash(dotArray);
                break;
                
              case 'solid':
              default:
                context.setLineDash([]);
                break;
            }
            
            // 轻微roughness效果（非艺术风格）
            if (element.roughness > 0 && element.roughness < ROUGHNESS.cartoonist) {
              drawSlightlyRoughEllipse(context, x + appState.scrollX + centerX, y + appState.scrollY + centerY, radiusX, radiusY, element.roughness);
            } else {
              // 完全平滑的椭圆
              context.stroke();
            }
            
            context.restore();
          }
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

          //描边
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