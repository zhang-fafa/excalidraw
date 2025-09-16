import clsx from "clsx";
import { Button } from "@excalidraw/excalidraw/components/Button";
import { t } from "@excalidraw/excalidraw/i18n";
import { eyeIcon } from "@excalidraw/excalidraw/components/icons";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";

import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";

import React, { useState, useEffect } from "react";
import { useCallbackRefState } from "@excalidraw/excalidraw/hooks/useCallbackRefState";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { preview } from "../../api/generate";

const PreviewButton = ({ onPreview }: { onPreview: () => void }) => {
  const resizedEyeIcon = React.cloneElement(eyeIcon, {
    style: { width: "16px", height: "16px", marginRight: "4px" },
  });
  return (
    <Button
      className={clsx("collab-button")}
      onSelect={onPreview}
      type="button"
      style={{ position: "relative", width: "auto" }}
      title={t("preview")}
    >
      {resizedEyeIcon}
      {t("preview")}
    </Button>
  );
};
const PreviewDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [excalidrawAPI] = useCallbackRefState<ExcalidrawImperativeAPI>();
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
        const elements = excalidrawAPI?.getSceneElements();
        // console.log('elements',elements)

        if (!elements || elements.length === 0) {
          setPreviewData(null);
          return;
        }
        const res = await preview(elements);
        setPreviewData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "预览失败");
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [isOpen, excalidrawAPI]);

  if (!isOpen) {
    return null;
  }
  const renderContent = () => {
    if (loading) {
      return <div>正在生成预览...</div>;
    }
    if (error) {
      return <div>错误：{error}</div>;
    }
    const elements = excalidrawAPI?.getSceneElements();
    if (!elements || elements.length === 0) {
      return <div>您的画布为空！</div>;
    }
    return <div>{previewData}</div>;
  };

  return (
    <Dialog onCloseRequest={onClose} title={t("preview")}>
      {renderContent()}
    </Dialog>
  );
};
export const Preview = () => {
  const { openDialog } = useUIAppState();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(!!openDialog);
  }, [openDialog]);
  return (
    <>
      <PreviewButton onPreview={() => setIsOpen(true)} />
      <PreviewDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
