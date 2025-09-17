import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import request from "../utils/request";
export const save = (param: readonly NonDeletedExcalidrawElement[]) => {
  return request.post("/api/save", { elements: param });
};

export const API = {
  save,
};
