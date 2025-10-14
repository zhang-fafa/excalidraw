import { PanelButton } from "./PanelButton"
import { LayersPanel } from "./LayersPanel";
import type { ActionManager } from "../../actions/manager";
import type { UIAppState, AppClassProperties } from "../../types";
import { useState } from "react";
import "./LayersPanel.scss"
import { CaptureUpdateAction } from "@excalidraw/element";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
export const Panel = ({
  app,
  actionManager
}: {
  app: AppClassProperties;
  actionManager: ActionManager;
}) => {
  const [showPanel, setShowPanel] = useState<boolean>(true);
  const elements:readonly NonDeletedExcalidrawElement[] = (app.scene.getNonDeletedElements() || []);
  const selectedElementIds = actionManager.getAppState().selectedElementIds;
  // 监听元素选择
  const handleElementSelect = (element: NonDeletedExcalidrawElement, multiSelect: boolean):Promise<void> => {
    return new Promise((resolve) => {
      const currentAppState = actionManager.getAppState();
      const currentSelectedIds = currentAppState.selectedElementIds;
      
      let newSelectedIds: Record<string, true>;
      
      if (multiSelect) {
        // 多选：切换选中状态
        newSelectedIds = currentSelectedIds[element.id] 
          ? Object.fromEntries(Object.entries(currentSelectedIds).filter(([id]) => id !== element.id))
          : { ...currentSelectedIds, [element.id]: true };
      } else {
        // 单选：只选择当前元素
        newSelectedIds = { [element.id]: true };
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

      requestAnimationFrame(() => resolve());
    })
  };
  // 监听元素可见性
  const handleElementToggleVisibility = (element: NonDeletedExcalidrawElement) => {
    // console.log("元素可见性", elementId);
    const elements = actionManager.getElementsIncludingDeleted();
    const updatedElements = elements.map(el => 
      el.id === element.id 
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
  const handleElementDelete = async (element: NonDeletedExcalidrawElement) => {
    //更新选中元素
    await handleElementSelect(element, false);
    // 然后查找并执行删除 action
    const deleteAction = actionManager.actions["deleteSelectedElements"];
    if (deleteAction) {
      actionManager.executeAction(deleteAction, "ui");
    }
  };
  // 监听元素重命名
  const handleElementRename = async (element: NonDeletedExcalidrawElement, newName: string) => {
    const trimmedName = newName.trim();
  
    if (!trimmedName) {
      console.warn('元素名称不能为空');
      return;
    }
    
    try {
      // 可选：如果需要保存到服务器
      // await saveElementNameToServer(element.id, trimmedName);
      
      const currentElements = actionManager.getElementsIncludingDeleted();
      const currentAppState = actionManager.getAppState();
      
      const hasName = currentElements.filter(el => el.id !== element.id && el.customData?.name === trimmedName);
      if (hasName.length) {
        alert('名称已存在');
        return false;
      }
      const updatedElements = currentElements.map(el => {
        if (el.id === element.id) {
          return {
            ...el,
            name: trimmedName,
            ...(el.type === 'text' && { 
              text: trimmedName,
              originalText: trimmedName 
            }),
            customData: {
              ...el.customData,
              name: trimmedName,
              lastRenamed: new Date().toISOString(),
            }
          };
        }
        return el;
      });
      
      actionManager.updater({
        elements: updatedElements,
        appState: currentAppState,
        captureUpdate: CaptureUpdateAction.IMMEDIATELY
      });
      
      // console.log(`元素 ${element.id} 重命名为: ${trimmedName}`);
      
    } catch (error) {
      console.error('重命名失败:', error);
      // 可以在这里显示错误提示给用户
    }
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
        status={showPanel}
      />
      <PanelButton
        title="图层"
        status={showPanel}
        onClick={setShowPanel}
      />
    </div>
  );
};