import { eyeIcon } from "@excalidraw/excalidraw/components/icons";
import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";

import { isDevEnv } from "@excalidraw/common";
import { useI18n } from "@excalidraw/excalidraw";

import type { Theme } from "@excalidraw/element/types";

import { LanguageList } from "../app-language/LanguageList";
import { ImportJSONIcon, ExportJSONIcon } from "../components/icons";

import { saveDebugState } from "./DebugCanvas";

import type { Dispatch, SetStateAction } from "react";

export const AppMainMenu: React.FC<{
  onCollabDialogOpen: () => any;
  isCollaborating: boolean;
  isCollabEnabled: boolean;
  theme: Theme | "system";
  setTheme: (theme: Theme | "system") => void;
  refresh: () => void;
  onChangeImportJSON: Dispatch<SetStateAction<boolean>>;
  onChangeExportJSON: Dispatch<SetStateAction<boolean>>;
}> = React.memo((props) => {
  const { t } = useI18n();
  const ExportJSON = () => {
    props.onChangeImportJSON(true);
  };
  const ImportJSON = () => {
    props.onChangeExportJSON(true);
  };

  return (
    <>
      <MainMenu>
        <MainMenu.DefaultItems.LoadScene />
        {/* 导入json */}
        <MainMenu.Item icon={<ImportJSONIcon />} onClick={ExportJSON}>
          {t("importJSON.title")}
        </MainMenu.Item>
        {/* 导出为json */}
        <MainMenu.Item icon={<ExportJSONIcon />} onClick={ImportJSON}>
          {t("exportJSON.title")}
        </MainMenu.Item>
        <MainMenu.DefaultItems.SaveToActiveFile />
        <MainMenu.DefaultItems.Export />
        <MainMenu.DefaultItems.SaveAsImage />
        {props.isCollabEnabled && (
          <MainMenu.DefaultItems.LiveCollaborationTrigger
            isCollaborating={props.isCollaborating}
            onSelect={() => props.onCollabDialogOpen()}
          />
        )}
        <MainMenu.DefaultItems.CommandPalette className="highlighted" />
        <MainMenu.DefaultItems.SearchMenu />
        <MainMenu.DefaultItems.Help />
        <MainMenu.DefaultItems.ClearCanvas />
        <MainMenu.Separator />
        {isDevEnv() && (
          <MainMenu.Item
            icon={eyeIcon}
            onClick={() => {
              if (window.visualDebug) {
                delete window.visualDebug;
                saveDebugState({ enabled: false });
              } else {
                window.visualDebug = { data: [] };
                saveDebugState({ enabled: true });
              }
              props?.refresh();
            }}
          >
            Visual Debug
          </MainMenu.Item>
        )}
        <MainMenu.Separator />
        <MainMenu.DefaultItems.ToggleTheme
          allowSystemTheme
          theme={props.theme}
          onSelect={props.setTheme}
        />
        <MainMenu.ItemCustom>
          <LanguageList style={{ width: "100%" }} />
        </MainMenu.ItemCustom>
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu>
    </>
  );
});
