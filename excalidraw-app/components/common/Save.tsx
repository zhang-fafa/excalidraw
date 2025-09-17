import clsx from "clsx";

import { Button } from "@excalidraw/excalidraw";

import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import { API } from "../../api";

export const Save = ({
  elements,
  isMobile,
  style,
}: {
  elements: readonly NonDeletedExcalidrawElement[];
  isMobile: boolean;
  style?: React.CSSProperties;
}) => {
  const saveData = async (elements: readonly NonDeletedExcalidrawElement[]) => {
    const res = await API.save(elements);
    // eslint-disable-next-line no-console
    console.log(res);
  };
  return (
    <>
      <Button
        className={clsx("collab-button")}
        onSelect={() => {
          saveData(elements);
        }}
        style={{
          ...style,
          position: "relative",
          width: "auto",
          padding: "0 20px",
        }}
      >
        保存
      </Button>
    </>
  );
};
