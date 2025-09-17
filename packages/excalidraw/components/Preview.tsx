import clsx from "clsx";
import { Button } from "@excalidraw/excalidraw/components/Button";
import { t } from "@excalidraw/excalidraw/i18n";
import { eyeIcon } from "@excalidraw/excalidraw/components/icons";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";

import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";

import React, { useState, useEffect } from "react";

import { useExcalidrawSetAppState } from "./App";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import { preview } from "../../../excalidraw-app/api/generate";
import { devLog } from "../../../excalidraw-app/utils/devlog";

const PreviewButton = ({ isMobile, onPreview }: { isMobile: boolean; onPreview: () => void }) => {
  const resizedEyeIcon = React.cloneElement(eyeIcon, {
    style: { width: "16px", height: "16px", marginRight: "4px" },
  });
  return (
    <Button
      className={!isMobile ? clsx("collab-button") : ""}
      onSelect={onPreview}
      type="button"
      style={!isMobile ? { position: "relative", width: "auto" } : { border: "none", width: "auto", borderRadius: "0", paddingLeft: "8px" }}
      title={t("preview")}
    >
      {resizedEyeIcon}
      {isMobile ? "" : t("preview")}
    </Button>
  );
};
const PreviewDialog = ({
  elements,
  isOpen,
  onClose,
}: {
  elements?: readonly NonDeletedExcalidrawElement[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const fetchPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!elements || elements.length === 0) {
          setPreviewData(null);
          return;
        }
        const res = await preview(elements);
        if (!res) {
          setError("预览失败");
          return;
        }
        setPreviewData(res.data?.image);
      } catch (err) {
        setError(err instanceof Error ? err.message : "预览失败");
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [isOpen, elements]);

  if (!isOpen || !elements) {
    return null;
  }
  const renderContent = () => {
    if (loading) {
      return <div>正在生成预览...</div>;
    }
    if (error) {
      return <div>错误：{error}</div>;
    }
    if (!elements || elements.length === 0) {
      return <div>您的画布为空！</div>;
    }
    return previewData ? (
      <div style={{ display: "flex" }}>
        <img src={previewData} alt="preview" style={{ maxHeight: "100%", maxWidth: "100%", margin: "auto" }} />
      </div>
    ) : (
      <div>暂无预览</div>
    );
  };

  return (
    <Dialog onCloseRequest={onClose} title={t("preview")} size={916}>
      {renderContent()}
    </Dialog>
  );
};
export const Preview = ({
  elements,
  isMobile,
}: {
  elements?: readonly NonDeletedExcalidrawElement[];
  isMobile: boolean;
} = {
  isMobile: false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  return (
    <>
      <PreviewButton
        onPreview={() => setIsPreviewOpen(true)}
        isMobile={isMobile}
      />
      <PreviewDialog
        elements={elements}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
};
