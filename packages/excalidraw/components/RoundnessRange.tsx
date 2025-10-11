import React, { useEffect } from "react";
import "./Range.scss"; // 复用相同的样式
import { 
  isArrowElement,  // 添加这个导入
} from "../../element/src/typeChecks";

import type { AppClassProperties } from "../types";

export type RoundnessRangeProps = {
  updateData: (value: number) => void;
  app: AppClassProperties;
  testId?: string;
};

export const RoundnessRange = ({ updateData, app, testId }: RoundnessRangeProps) => {
  const rangeRef = React.useRef<HTMLInputElement>(null);
  const valueRef = React.useRef<HTMLDivElement>(null);
  const selectedElements = app.scene.getSelectedElements(app.state);
  
  let hasCommonRoundness = true;
  const firstElement = selectedElements.at(0);
  
  // 计算选中元素的圆角值 (转换为0-100)
  const leastCommonRoundness = selectedElements.reduce((acc, element) => {
    if (!element.hasOwnProperty("roundness") || isArrowElement(element)) {
      return acc;
    }
    
    let elementRoundness = 0;
    if (element.roundness?.value !== undefined) {
      elementRoundness = Math.round(element.roundness.value * 100);
    } else if (element.roundness) {
      elementRoundness = 50; // 兼容旧版本的 boolean roundness
    }
    
    if (acc != null && acc !== elementRoundness) {
      hasCommonRoundness = false;
    }
    if (acc == null || acc > elementRoundness) {
      return elementRoundness;
    }
    return acc;
  }, firstElement && !isArrowElement(firstElement) && firstElement.hasOwnProperty("roundness") 
    ? (firstElement.roundness?.value !== undefined 
        ? Math.round(firstElement.roundness.value * 100)
        : (firstElement.roundness ? 50 : 0))
    : null);

  const value = leastCommonRoundness ?? (
    typeof app.state.currentItemRoundness === "number" 
      ? app.state.currentItemRoundness 
      : (app.state.currentItemRoundness === "round" ? 50 : 0)
  );

  useEffect(() => {
    if (rangeRef.current && valueRef.current) {
      const rangeElement = rangeRef.current;
      const valueElement = valueRef.current;
      const inputWidth = rangeElement.offsetWidth;
      const thumbWidth = 15; // 15 is the width of the thumb
      const position =
        (value / 100) * (inputWidth - thumbWidth) + thumbWidth / 2;
      valueElement.style.left = `${position}px`;
      rangeElement.style.background = `linear-gradient(to right, var(--color-slider-track) 0%, var(--color-slider-track) ${value}%, var(--button-bg) ${value}%, var(--button-bg) 100%)`;
    }
  }, [value]);

  return (
    <label className="control-label">
      Roundness {/* 或者使用 t("labels.roundness") 如果翻译文件中有这个key */}
      <div className="range-wrapper">
        <input
          style={{
            ["--color-slider-track" as string]: hasCommonRoundness
              ? undefined
              : "var(--button-bg)",
          }}
          ref={rangeRef}
          type="range"
          min="0"
          max="100"
          step="1" // 可以调整步长
          onChange={(event) => {
            updateData(+event.target.value);
          }}
          value={value}
          className="range-input"
          data-testid={testId}
        />
        <div className="value-bubble" ref={valueRef}>
          {value !== 0 ? value : null}
        </div>
        <div className="zero-label">0</div>
      </div>
    </label>
  );
};