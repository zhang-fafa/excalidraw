import { PanelButton } from "./PanelButton"
import { LayersPanel } from "./LayersPanel";
import type { ActionManager } from "../../actions/manager";
import type { UIAppState, AppClassProperties } from "../../types";
import { useEffect } from "react";
import "./LayersPanel.scss"
import { CaptureUpdateAction } from "@excalidraw/element";
export const Panel = ({
  app,
  actionManager
}: {
  app: AppClassProperties;
  actionManager: ActionManager;
}) => {
  const elements = app.scene.getNonDeletedElements();
  const selectedElementIds = actionManager.getAppState().selectedElementIds;
  
  // 监听元素选择
  const handleElementSelect = (elementId: string, multiSelect: boolean) => {
    // console.log("元素选择", elementId, multiSelect);
    const currentAppState = actionManager.getAppState();
    const currentSelectedIds = currentAppState.selectedElementIds;
    
    let newSelectedIds: Record<string, true>;
    
    if (multiSelect) {
      // 多选：切换选中状态
      newSelectedIds = currentSelectedIds[elementId] 
        ? Object.fromEntries(Object.entries(currentSelectedIds).filter(([id]) => id !== elementId))
        : { ...currentSelectedIds, [elementId]: true };
    } else {
      // 单选：只选择当前元素
      newSelectedIds = { [elementId]: true };
    }
    // 更新应用状态
    actionManager.updater({
      elements: actionManager.getElementsIncludingDeleted(),
      appState: {
        ...currentAppState,
        selectedElementIds: newSelectedIds
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY
    });
  };
  // 监听元素可见性
  const handleElementToggleVisibility = (elementId: string) => {
    // console.log("元素可见性", elementId);
    const elements = actionManager.getElementsIncludingDeleted();
    const updatedElements = elements.map(el => 
      el.id === elementId 
        ? { ...el, isDeleted: !el.isDeleted } // 或者使用其他可见性属性
        : el
    );
    actionManager.updater({
      elements: updatedElements,
      appState: actionManager.getAppState(),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY
    });
  };
  // 监听元素重删除
  const handleElementDelete = (elementId: string) => {
    // console.log("元素删除", elementId);
    const currentAppState = actionManager.getAppState();
  
    // 首先选中要删除的元素
    const newSelectedIds = { [elementId]: true as const };
    
    // 更新选中状态
    actionManager.updater({
      elements: actionManager.getElementsIncludingDeleted(),
      appState: {
        ...currentAppState,
        selectedElementIds: newSelectedIds
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY // 使用 EVENTUALLY 而不是 IMMEDIATELY
    });
    
    // 然后查找并执行删除 action
    const deleteAction = actionManager.actions["deleteSelectedElements"];
    if (deleteAction) {
      actionManager.executeAction(deleteAction, "ui");
    }
  };
  // 监听元素重命名
  const handleElementRename = (elementId: string, newName: string) => {
    
  };

  return (
    <div className="panel">
      <LayersPanel 
        elements={elements}
        selectedElementIds={selectedElementIds}
        onElementSelect={handleElementSelect}
        onElementToggleVisibility={handleElementToggleVisibility}
        onElementDelete={handleElementDelete}
        onElementRename={handleElementRename}
      />
      <PanelButton title="图层" onClick={() => {}} />
    </div>
  );
};