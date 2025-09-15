import clsx from "clsx";
import { Button } from "@excalidraw/excalidraw/components/Button";
import { t } from "@excalidraw/excalidraw/i18n";
import { eyeIcon } from "@excalidraw/excalidraw/components/icons";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";
import React from "react";
import { useState, useEffect } from "react";

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
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog onCloseRequest={onClose} title={t("preview")}>
      <>11</>
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
