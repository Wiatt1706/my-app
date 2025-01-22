import { useAiboard } from "@/hooks/useAiboard";
import { useEffect, useRef, useState } from "react";
import { DirectionalLight } from "three";
import { z } from "zod";

// 为灯光位置定义类型
type LightPosition = [number, number, number];

export async function tset01(input: { tes: number }) {
  console.log("input", input);
}

const Lights = () => {
  const lightRef = useRef<DirectionalLight | null>(null); // 使用 THREE.js 类型
  const { dispatch } = useAiboard();

  // 使用状态来控制灯光属性
  const [lightIntensity, setLightIntensity] = useState<number>(1);
  const [lightColor, setLightColor] = useState<string>("#ffd700");
  const [lightPosition, setLightPosition] = useState<LightPosition>([
    0, 10, 10,
  ]);

  // 控制灯光是否开启
  const [lightEnabled, setLightEnabled] = useState<boolean>(true); // 默认灯光开启

  useEffect(() => {
    // 设置页面信息
    dispatch({
      type: "SET_PAGE_INFO",
      payload: {
        route: "/room",
        pageId: "roomShow",
        description: "房间三维空间展示页面",
      },
    });

    const actions = [
      {
        name: "test001",
        description: "控制灯光强度，参数控制1-0之间",
        schema: z.object({
          tes: z.number(),
        }),
        method: () => tset01,
      },
      {
        name: "handleLightColorChange",
        description: "控制灯光颜色",
        schema: z.object({
          newColor: z.string(),
        }),
        method: () => handleLightColorChange,
      },
      {
        name: "closeLight",
        description: "关灯操作",
        schema: z.object({
          enabled: z.boolean(),
        }),
        method: () => toggleLight(false),
        autoExecute: true,
      },
      {
        name: "openLight",
        description: "开灯操作",
        schema: z.object({
          enabled: z.boolean(),
        }),
        method: () => toggleLight(true),
        autoExecute: true,
      },
    ];

    // 设置可用操作
    dispatch({
      type: "REGISTER_ACTION",
      payload: { availableActions: actions },
    });
  }, [dispatch]);

  // 控制灯光强度
  const handleLightIntensityChange = (input: { newIntensity: number }) => {
    setLightIntensity(input.newIntensity);
    console.log("newIntensity", input.newIntensity);
    if (lightRef.current) {
      lightRef.current.intensity = input.newIntensity;
    }
  };

  // 控制灯光颜色
  const handleLightColorChange = (newColor: string) => {
    setLightColor(newColor);
    if (lightRef.current) {
      lightRef.current.color.set(newColor);
    }
  };

  // 控制灯光位置
  const handleLightPositionChange = (newPosition: LightPosition) => {
    setLightPosition(newPosition);
    if (lightRef.current) {
      lightRef.current.position.set(...newPosition);
    }
  };

  // 切换灯光开关
  const toggleLight = (enabled: boolean) => {
    setLightEnabled(enabled);
    console.log("Light enabled:", enabled);
  };

  return (
    <>
      {/* 只有当 lightEnabled 为 true 时，才展示灯光组件 */}
      {lightEnabled && (
        <>
          <ambientLight intensity={lightIntensity} color={"#ffffff"} />
          <directionalLight
            ref={lightRef}
            position={lightPosition}
            color={lightColor}
            intensity={lightIntensity}
          />
        </>
      )}

      <hemisphereLight args={["#654321", "#87CEEB", 1]} />
    </>
  );
};

export default Lights;
