import React, { JSX } from "react";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import "./LayersPanel.scss";
import {
  FreedrawIcon,
  RectangleIcon,
  DiamondIcon,
  FontFamilyNormalIcon,
  TrashIcon,
  ArrowRightIcon,
  SelectionIcon,
  EllipseIcon,
  ImageIcon,
  frameToolIcon,
  MagicIcon,
  EmbedIcon,
  LineIcon
} from "../icons";

interface LayersPanelProps {
  elements: readonly NonDeletedExcalidrawElement[];
  selectedElementIds: Record<string, boolean>;
  onElementSelect: (elementId: string, multiSelect: boolean) => void;
  onElementToggleVisibility: (elementId: string) => void;
  onElementDelete: (elementId: string) => void;
  onElementRename: (elementId: string, newName: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElementIds,
  onElementSelect,
  onElementToggleVisibility,
  onElementDelete,
  onElementRename,
}) => {
  const getElementIcon = (element: NonDeletedExcalidrawElement) => {
    switch (element.type) {
      case "text": return FontFamilyNormalIcon;
      case "line": return LineIcon;
      case "arrow": return ArrowRightIcon;
      case "selection": return SelectionIcon;
      case "rectangle": return RectangleIcon;
      case "diamond": return DiamondIcon;
      case "ellipse": return EllipseIcon;
      case "freedraw": return FreedrawIcon;
      case "image": return ImageIcon;
      case "frame": return frameToolIcon;
      case "magicframe": return MagicIcon;
      case "iframe": return "web";
      case "embeddable": return EmbedIcon;
      default: return "❓";
    }
  };

  const getElementDisplayName = (element: NonDeletedExcalidrawElement) => {
    // 如果元素有自定义名称，使用自定义名称
    if (element.customData?.name) {
      return element.customData.name;
    }
    
    // 否则使用类型 + ID 的组合
    const typeNames = {
      text: "文本",
      line: "直线",
      arrow: "箭头", 
      selection: "选择区域",
      rectangle: "矩形",
      diamond: "菱形",
      ellipse: "椭圆",
      freedraw: "手绘",
      image: "图片",
      frame: "框架",
      magicframe: "魔术框架",
      iframe: "内嵌框架",
      embeddable: "嵌入内容",
    } as const;
    
    return `${element.id.slice(0, 8)}`;
  };

  return (
    <div className="layers-panel">      
      <div className="layers-list">
        {elements.map((element, index) => (
          <LayerItem
            key={element.id}
            element={element}
            index={elements.length - index} // 显示层级顺序
            isSelected={!!selectedElementIds[element.id]}
            icon={getElementIcon(element)}
            displayName={getElementDisplayName(element)}
            onSelect={(multiSelect) => onElementSelect(element.id, multiSelect)}
            onToggleVisibility={() => onElementToggleVisibility(element.id)}
            onDelete={() => onElementDelete(element.id)}
            onRename={(newName) => onElementRename(element.id, newName)}
          />
        ))}
      </div>
    </div>
  );
};

interface LayerItemProps {
  element: NonDeletedExcalidrawElement;
  index: number;
  isSelected: boolean;
  icon: string | JSX.Element;
  displayName: string;
  onSelect: (multiSelect: boolean) => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  element,
  index,
  isSelected,
  icon,
  displayName,
  onSelect,
  onToggleVisibility,
  onDelete,
  onRename,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(displayName);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTempName(displayName);
  };

  const handleNameSubmit = () => {
    onRename(tempName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setTempName(displayName);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className={`layer-item ${isSelected ? 'selected' : ''} ${element.isDeleted ? 'deleted' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="layer-content">
        <span className="layer-index">{index}</span>
        <span className="layer-icon">{icon}</span>
        {isEditing ? (
          <input
            className="layer-name-input"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span className="layer-name" title={displayName}>
            {displayName}
          </span>
        )}
      </div>
      
      <div className="layer-actions">
        {/* <button
          className={`visibility-toggle ${element.opacity === 0 ? 'hidden' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          title={element.opacity === 0 ? "显示" : "隐藏"}
        >
          {element.opacity === 0 ? "显示" : "隐藏"}
        </button> */}
        
        <button
          className="del"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="删除"
        >
          <div className="icon">{TrashIcon}</div>
        </button>
      </div>
    </div>
  );
};