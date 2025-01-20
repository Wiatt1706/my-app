"use client";

import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  TransformControls,
} from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Model, useStateContext } from "./StateContext";

type ControlsProps = {
  size?: number;
  [key: string]: any;
};

export default function Controls({
  size,
  ...props
}: ControlsProps): JSX.Element {
  const controls = useRef<THREE.Object3D | null>(null);
  const { scene } = useThree();
  
  const { target, setTarget, modelList, setModelList, controlStatus } =
    useStateContext();
  const { isDragging, mouseStage } = controlStatus;

  const updateModelListRecursively = (
    modelList: Model[],
    targetId: string,
    updatedProperties: Partial<Model>
  ): Model[] => {
    return modelList.map((model) => {
      if (model.id === targetId) {
        // 更新目标模型的属性
        return {
          ...model,
          ...updatedProperties,
        };
      } else if (model.children && model.children.length > 0) {
        // 如果模型具有子节点，则递归更新子节点
        return {
          ...model,
          children: updateModelListRecursively(
            model.children,
            targetId,
            updatedProperties
          ),
        };
      }
      return model;
    });
  };

  const handleTransformEnd = () => {
    if (target && target.id && target.object) {
      // 更新模型列表
      const updatedModelList = updateModelListRecursively(
        modelList,
        target.id,
        {
          position: target.object.position.toArray(),
          rotation: target.object.rotation.toArray() as [
            number,
            number,
            number,
            THREE.EulerOrder
          ],
          scale: target.object.scale.toArray(),
        }
      );
      setModelList(updatedModelList);
    }
  };

  useEffect(() => {
    if (target && !target.object) {
      let targetMesh: THREE.Mesh | null = null;
      console.log("target-update");
      scene.traverse((node) => {
        if (
          node instanceof THREE.Mesh &&
          node.userData["primaryId"] === target.id
        ) {
          targetMesh = node;
        }
      });
      setTarget({ object: targetMesh, id: target.id });
    }
  }, [target?.id, scene, setTarget]);

  return (
    <>
      <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>

      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        enableZoom={true}
        enablePan={mouseStage === 1 && !isDragging}
        dampingFactor={1}
        mouseButtons={{ LEFT: 2, MIDDLE: 1, RIGHT: 0 }}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.9}
      />

      {target && target.object && (
        <TransformControls
          onMouseUp={handleTransformEnd}
          object={target.object}
          mode={"translate"}
        />
      )}
      {/* <CameraModel /> */}
    </>
  );
}
