import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import request from "../utils/request";

export const preview = (
  param: readonly NonDeletedExcalidrawElement[] | undefined,
) => {
  if (!param) {
    return;
  }
  return request.post("/api/image/preview", { elements: param });
};
