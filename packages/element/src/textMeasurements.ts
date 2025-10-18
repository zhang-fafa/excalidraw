import {
  BOUND_TEXT_PADDING,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  getFontString,
  isTestEnv,
  normalizeEOL,
} from "@excalidraw/common";

import type { FontString, ExcalidrawTextElement } from "./types";

export const measureText = (
  textElement: ExcalidrawTextElement,
  font: FontString,
  lineHeight: ExcalidrawTextElement["lineHeight"],
  textDirection: "horizontal" | "vertical" = "horizontal",
) => {
  if (textDirection === "vertical") {
    return measureVerticalText(textElement.text, font, lineHeight);
  }
  const _text = textElement.text
    .split("\n")
    // replace empty lines with single space because leading/trailing empty
    // lines would be stripped from computation
    .map((x) => x || " ")
    .join("\n");
  const fontSize = parseFloat(font);
  const height = getTextHeight(_text, fontSize, lineHeight);
  const width = getTextWidth(_text, font);
  console.log('width', width, textElement.text, _text)
  return { width, height };
};

const DUMMY_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toLocaleUpperCase();

// FIXME rename to getApproxMinContainerWidth
export const getApproxMinLineWidth = (
  font: FontString,
  lineHeight: ExcalidrawTextElement["lineHeight"],
  letterSpacing: ExcalidrawTextElement["letterSpacing"] = 0,
) => {
  const maxCharWidth = getMaxCharWidth(font);
  if (maxCharWidth === 0) {
    return (
      measureText({text: DUMMY_TEXT.split("").join("\n"), letterSpacing} as ExcalidrawTextElement, font, lineHeight).width +
      BOUND_TEXT_PADDING * 2
    );
  }
  return maxCharWidth + BOUND_TEXT_PADDING * 2;
};

export const getMinTextElementWidth = (
  font: FontString,
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  return measureText({text: ""} as ExcalidrawTextElement, font, lineHeight).width + BOUND_TEXT_PADDING * 2;
};

export const isMeasureTextSupported = () => {
  const width = getTextWidth(
    DUMMY_TEXT,
    getFontString({
      fontSize: DEFAULT_FONT_SIZE,
      fontFamily: DEFAULT_FONT_FAMILY,
    }),
  );
  return width > 0;
};

export const normalizeText = (text: string) => {
  return (
    normalizeEOL(text)
      // replace tabs with spaces so they render and measure correctly
      .replace(/\t/g, "        ")
  );
};

const splitIntoLines = (text: string) => {
  return normalizeText(text).split("\n");
};

/**
 * To get unitless line-height (if unknown) we can calculate it by dividing
 * height-per-line by fontSize.
 */
export const detectLineHeight = (textElement: ExcalidrawTextElement) => {
  const lineCount = splitIntoLines(textElement.text).length;
  return (textElement.height /
    lineCount /
    textElement.fontSize) as ExcalidrawTextElement["lineHeight"];
};

/**
 * We calculate the line height from the font size and the unitless line height,
 * aligning with the W3C spec.
 */
export const getLineHeightInPx = (
  fontSize: ExcalidrawTextElement["fontSize"],
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  return fontSize * lineHeight;
};

// FIXME rename to getApproxMinContainerHeight
export const getApproxMinLineHeight = (
  fontSize: ExcalidrawTextElement["fontSize"],
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  return getLineHeightInPx(fontSize, lineHeight) + BOUND_TEXT_PADDING * 2;
};

let textMetricsProvider: TextMetricsProvider | undefined;

/**
 * Set a custom text metrics provider.
 *
 * Useful for overriding the width calculation algorithm where canvas API is not available / desired.
 */
export const setCustomTextMetricsProvider = (provider: TextMetricsProvider) => {
  textMetricsProvider = provider;
};

export interface TextMetricsProvider {
  getLineWidth(text: string, fontString: FontString): number;
  getVerticalCharHeight?(fontString: FontString): number;
}

class CanvasTextMetricsProvider implements TextMetricsProvider {
  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement("canvas");
  }

  /**
   * We need to use the advance width as that's the closest thing to the browser wrapping algo, hence using it for:
   * - text wrapping
   * - wysiwyg editor (+padding)
   *
   * > The advance width is the distance between the glyph's initial pen position and the next glyph's initial pen position.
   */
  public getLineWidth(text: string, fontString: FontString): number {
    const context = this.canvas.getContext("2d")!;
    context.font = fontString;
    const metrics = context.measureText(text);
    const advanceWidth = metrics.width;

    // since in test env the canvas measureText algo
    // doesn't measure text and instead just returns number of
    // characters hence we assume that each letteris 10px
    if (isTestEnv()) {
      return advanceWidth * 10;
    }

    return advanceWidth;
  }

  // 新增：计算竖排时字符的高度
  public getVerticalCharHeight(fontString: FontString): number {
    const context = this.canvas.getContext("2d")!;
    context.font = fontString;
    
    // 使用一个典型字符来测量高度
    const metrics = context.measureText("测");
    
    // 在竖排模式下，字符高度大约等于字体大小
    const fontSize = parseFloat(fontString);
    
    if (isTestEnv()) {
      return fontSize;
    }
    // 如果 Canvas API 支持，使用实际测量值，否则使用字体大小
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return actualHeight > 0 ? actualHeight * 1.1 : fontSize * 1.2;
  }
}

export const getLineWidth = (text: string, font: FontString) => {
  if (!textMetricsProvider) {
    textMetricsProvider = new CanvasTextMetricsProvider();
  }

  return textMetricsProvider.getLineWidth(text, font);
};

export const getTextWidth = (text: string, font: FontString) => {
  const lines = splitIntoLines(text);
  let width = 0;
  lines.forEach((line) => {
    width = Math.max(width, getLineWidth(line, font));
  });

  return width;
};

export const getTextHeight = (
  text: string,
  fontSize: number,
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  const lineCount = splitIntoLines(text).length;
  return getLineHeightInPx(fontSize, lineHeight) * lineCount;
};

export const charWidth = (() => {
  const cachedCharWidth: { [key: FontString]: Array<number> } = {};

  const calculate = (char: string, font: FontString) => {
    const unicode = char.charCodeAt(0);
    if (!cachedCharWidth[font]) {
      cachedCharWidth[font] = [];
    }
    if (!cachedCharWidth[font][unicode]) {
      const width = getLineWidth(char, font);
      cachedCharWidth[font][unicode] = width;
    }

    return cachedCharWidth[font][unicode];
  };

  const getCache = (font: FontString) => {
    return cachedCharWidth[font];
  };

  const clearCache = (font: FontString) => {
    cachedCharWidth[font] = [];
  };

  return {
    calculate,
    getCache,
    clearCache,
  };
})();

export const getMinCharWidth = (font: FontString) => {
  const cache = charWidth.getCache(font);
  if (!cache) {
    return 0;
  }
  const cacheWithOutEmpty = cache.filter((val) => val !== undefined);

  return Math.min(...cacheWithOutEmpty);
};

export const getMaxCharWidth = (font: FontString) => {
  const cache = charWidth.getCache(font);
  if (!cache) {
    return 0;
  }
  const cacheWithOutEmpty = cache.filter((val) => val !== undefined);
  return Math.max(...cacheWithOutEmpty);
};


// 添加竖排文字测量函数
const measureVerticalText = (
  text: string,
  font: FontString,
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  const _text = text
    .split("\n")
    .map((x) => x || " ")
    .join("\n");
  
  const fontSize = parseFloat(font);
  const width = getVerticalTextWidth(_text, fontSize, lineHeight);
  const height = getVerticalTextHeight(_text, font);
  
  return { width, height };
};

// 竖排文字宽度计算：行数 × 行高
const getVerticalTextWidth = (
  text: string,
  fontSize: number,
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  const lines = splitIntoLines(text);
  const lineCount = lines.length;
  return getLineHeightInPx(fontSize, lineHeight) * lineCount;
};

// 竖排文字高度计算：最长行的字符数 × 字符高度
const getVerticalTextHeight = (text: string, font: FontString) => {
  const lines = splitIntoLines(text);
  let maxCharsInLine = 0;
  
  lines.forEach((line) => {
    // 使用 Array.from 正确计算 Unicode 字符数
    const charCount = Array.from(line).length;
    maxCharsInLine = Math.max(maxCharsInLine, charCount);
  });
  // 对于竖排文字，我们需要考虑字符的实际高度
  // 这里使用一个字符的宽度作为高度的近似值
  const charHeight = getVerticalCharHeight(font);
  return maxCharsInLine * charHeight;
};

// 计算竖排时单个字符的高度
const getVerticalCharHeight = (font: FontString) => {
  if (!textMetricsProvider) {
    textMetricsProvider = new CanvasTextMetricsProvider();
  }
  if (textMetricsProvider.getVerticalCharHeight) {
    return textMetricsProvider.getVerticalCharHeight(font);
  }

  // 对于竖排，字符高度约等于字体大小
  const fontSize = parseFloat(font);
  return fontSize * 1.2; // 添加一些间距
};

// 添加检测竖排文字中混合字符的函数
export const hasRotatableChars = (text: string): boolean => {
  return /[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(text);
};

// 添加竖排相关的辅助函数
export const getApproxMinVerticalLineWidth = (
  font: FontString,
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  const fontSize = parseFloat(font);
  return getLineHeightInPx(fontSize, lineHeight) + BOUND_TEXT_PADDING * 2;
};

export const getMinVerticalTextElementWidth = (
  font: FontString,
  lineHeight: ExcalidrawTextElement["lineHeight"],
) => {
  return getApproxMinVerticalLineWidth(font, lineHeight);
};

// 添加计算竖排文字中需要旋转字符的高度调整
export const getVerticalTextHeightWithRotation = (text: string, font: FontString) => {
  const lines = splitIntoLines(text);
  let maxHeight = 0;
  lines.forEach((line) => {
    const chars = Array.from(line);
    let lineHeight = 0;
    chars.forEach((char) => {
      if (/[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(char)) {
        // 旋转的字符需要更多垂直空间
        lineHeight += getLineWidth(char, font); // 旋转后宽度变成高度
      } else {
        // 正常字符
        lineHeight += getVerticalCharHeight(font);
      }
    });
    maxHeight = Math.max(maxHeight, lineHeight);
  });
  return maxHeight;
};