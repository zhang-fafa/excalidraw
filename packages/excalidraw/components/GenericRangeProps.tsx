import React, { useEffect } from "react";
import type { AppClassProperties } from "../types";
import { 
  isArrowElement,  
} from "../../element/src/typeChecks";
import type {
  ExcalidrawElement
} from "@excalidraw/element/types";

// 通用范围组件的props类型
export type GenericRangeProps<T extends ExcalidrawElement> = {
  updateData: (value: number) => void;
  app: AppClassProperties;
  testId?: string;
  elementKey: keyof ExcalidrawElement;
  // 新增配置项
  min?: number;
  max?: number;
  step?: number;
  label: string;
  defaultValue: number;
  // 值提取和转换函数
  extractValue?: (element: T, key: string) => number | null;
  // 元素过滤函数
  elementFilter?: (element: T) => boolean;
  // 当前项状态键名
  currentItemStateKey?: string;
};

// 通用范围组件
export const GenericRange = <T extends ExcalidrawElement>({
  updateData,
  app,
  testId,
  elementKey,
  min = 0,
  max = 100,
  step = 1,
  label,
  defaultValue = 0,
  extractValue,
  elementFilter,
  currentItemStateKey,
}: GenericRangeProps<ExcalidrawElement>) => {
  const rangeRef = React.useRef<HTMLInputElement>(null);
  const valueRef = React.useRef<HTMLDivElement>(null);
  const selectedElements = app.scene.getSelectedElements(app.state);
  // 默认值提取函数
  const defaultExtractValue = (element: any, key: string): number | null => {
    const value = element[key];
    
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'object' && value?.value !== undefined) {
      return value.value;
    }
    
    // 处理 boolean 类型的roundness等属性
    if (typeof value === 'boolean') {
      return value ? max / 2 : min;
    }
    
    return null;
  };
  // 默认元素过滤函数
  const defaultElementFilter = (element: any): boolean => {
    return elementKey in element;
  };
  const valueExtractor = extractValue || defaultExtractValue;
  const elementFilterFn = elementFilter || defaultElementFilter;
  // 过滤符合条件的元素
  const validElements = selectedElements.filter(elementFilterFn);
  
  let hasCommonValue = true;
  const firstElement = validElements.at(0);
  
  // 计算最小公共值
  const leastCommonValue = validElements.reduce((acc, element) => {
    if (isArrowElement(element)) {
      return acc;
    }
    
    const elementValue = valueExtractor(element, elementKey);
    
    if (elementValue === null) {
      return acc;
    }
    
    const normalizedValue = Math.round(elementValue);
    
    if (acc !== null && acc !== normalizedValue) {
      hasCommonValue = false;
    }
    
    if (acc === null || acc > normalizedValue) {
      return normalizedValue;
    }
    
    return acc;
  }, firstElement ? valueExtractor(firstElement, elementKey) : null);
  // 获取当前值
  const getCurrentValue = () => {
    if (leastCommonValue !== null) {
      return leastCommonValue;
    }
    
    if (currentItemStateKey && currentItemStateKey in app.state) {
      const stateValue = (app.state as any)[currentItemStateKey];
      if (typeof stateValue === 'number') {
        return stateValue;
      }
      if (stateValue === 'round') {
        return max / 2;
      }
    }
    
    return defaultValue;
  };
  const value = getCurrentValue();
  const displayLabel = label;
  useEffect(() => {
    if (rangeRef.current && valueRef.current) {
      const rangeElement = rangeRef.current;
      const valueElement = valueRef.current;
      const inputWidth = rangeElement.offsetWidth;
      const thumbWidth = 15;
      const position = ((value - min) / (max - min)) * (inputWidth - thumbWidth) + thumbWidth / 2;
      valueElement.style.left = `${position}px`;
      
      const progressPercent = ((value - min) / (max - min)) * 100;
      rangeElement.style.background = `linear-gradient(to right, var(--color-slider-track) 0%, var(--color-slider-track) ${progressPercent}%, var(--button-bg) ${progressPercent}%, var(--button-bg) 100%)`;
    }
  }, [value, min, max]);
  return (
    <label className="control-label">
      {displayLabel}
      <div className="range-wrapper">
        <input
          style={{
            ["--color-slider-track" as string]: hasCommonValue
              ? undefined
              : "var(--button-bg)",
          }}
          ref={rangeRef}
          type="range"
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            updateData(+event.target.value);
          }}
          value={value}
          className="range-input"
          data-testid={testId}
        />
        <div className="value-bubble" ref={valueRef}>
          {value !== min ? value : null}
        </div>
        <div className="zero-label">{min}</div>
      </div>
    </label>
  );
};