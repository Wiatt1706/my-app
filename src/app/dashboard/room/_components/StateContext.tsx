import React, { createContext, useContext, useState } from "react";
import * as THREE from "three";

// 定义 Target 类型
export type Target = {
  id: string;
  object: THREE.Object3D | null;
};

// 定义 Model 类型
export type Model = {
  id: string;
  position?: number[];
  rotation?: [number, number, number, THREE.EulerOrder];
  scale?: number[];
  children?: Model[];
  [key: string]: any;
};

// 定义 ControlStatus 类型
export type ControlStatus = {
  isDragging: boolean;
  mouseStage: number;
};

// 定义 SystemInfo 类型
export type SystemInfo = {
  sceneColor: string;
  sceneEvn: string;
  sceneFogColor: string;
  sceneFog: boolean;
  openGrid: boolean;
};

// 定义 StateContextType 类型
type StateContextType = {
  target: Target | null;
  setTarget: React.Dispatch<React.SetStateAction<Target | null>>;
  modelList: Model[];
  setModelList: React.Dispatch<React.SetStateAction<Model[]>>;
  controlStatus: ControlStatus;
  setControlStatus: React.Dispatch<React.SetStateAction<ControlStatus>>;
  systemInfo: SystemInfo;
  setSystemInfo: (key: keyof SystemInfo, value: any) => void;
};

// 创建 Context
const StateContext = createContext<StateContextType | undefined>(undefined);

// StateProvider 组件
export const StateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [target, setTarget] = useState<Target | null>(null);
  const [modelList, setModelList] = useState<Model[]>([]);
  const [controlStatus, setControlStatus] = useState<ControlStatus>({
    isDragging: false,
    mouseStage: 0,
  });
  const [systemInfo, setSystemInfoState] = useState<SystemInfo>({
    sceneColor: "#ffffff",
    sceneEvn: "city",
    sceneFogColor: "#ffffff",
    sceneFog: false,
    openGrid: true,
  });

  // 自定义 setSystemInfo 方法
  const setSystemInfo = (key: keyof SystemInfo, value: any) => {
    setSystemInfoState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <StateContext.Provider
      value={{
        target,
        setTarget,
        modelList,
        setModelList,
        controlStatus,
        setControlStatus,
        systemInfo,
        setSystemInfo,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

// 自定义 Hook
export const useStateContext = (): StateContextType => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};
