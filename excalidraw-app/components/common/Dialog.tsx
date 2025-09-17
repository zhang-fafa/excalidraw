import {
  Dialog,
  type DialogSize,
} from "@excalidraw/excalidraw/components/Dialog";

export const MyDialog = ({
  title,
  children,
  isOpen,
  onClose,
  size,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: DialogSize;
}) => {
  if (!isOpen) {
    return null;
  }
  return (
    <Dialog onCloseRequest={onClose} title={title} size={size}>
      {children}
    </Dialog>
  );
};
