import { useAiboard } from "@/hooks/useAiboard";
import { useEffect, useRef } from "react";

const Lights = () => {
  const lightRef = useRef();


  const { dispatch } = useAiboard();
  
    useEffect(() => {
      // 设置页面信息
      dispatch({
        type: "SET_PAGE_INFO",
        payload: {
          route: "/menu",
          pageId: "menuTable",
          description: "Manage system menus.",
        },
      });
  
      const actions = [
        {
          name: "exportMenu",
          description: "导出菜单",
          schema: null,
          method: () =>
            exportTableToCSV(table, {
              filename: "systemMenus",
              excludeColumns: ["select", "actions"],
            }),
        },
      ];
  
      // 设置可用操作
      dispatch({
        type: "REGISTER_ACTION",
        payload: { availableActions: actions },
      });
    }, [dispatch]);
  
  return (
    <>
      <ambientLight intensity={1} color={"#ffffff"} />
      <directionalLight
        ref={lightRef}
        position={[0, 10, 10]}
        color={"#ffd700"}
        intensity={1.5}
      />
      <hemisphereLight args={["#654321", "#87CEEB", 0.9]} />
    </>
  );
};

export default Lights;