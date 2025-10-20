import { useState } from "react";

import { Button } from "@excalidraw/excalidraw";
import { MyDialog } from "./common/Dialog";

export const FunctionLog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <MyDialog
        title={"功能"}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
        <a href="https://www.yuque.com/pangpangtang-ejtz2/rd3fkg/ygceml7vinsi6z9c?singleDoc# 《图片模板重构》">图片模板重构功能描述</a>
      </MyDialog>
      <Button
        className={"collab-button"}
        onSelect={() => {
          setIsDialogOpen(true)
        }}
        style={{
          position: "relative",
          width: "auto",
          padding: "0 20px",
        }}
      >
        功能
      </Button>
    </>
  );
};
