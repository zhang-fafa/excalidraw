import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { Ordered } from "@excalidraw/element/types";

import request from "../utils/request";

export const preview = (
  param: readonly Ordered<NonDeletedExcalidrawElement>[] | undefined,
) => {
  return request.post("/api/image/preview", { elements: param });
};
