import * as THREE from "three";
import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { button, buttonGroup, folder } from "leva";
import { CameraControls } from "@react-three/drei";

const { DEG2RAD } = THREE.MathUtils;
type LevaConfig = {
  thetaGrp?: any;
  phiGrp?: any;
  truckGrp?: any;
  dollyGrp?: any;
  zoomGrp?: any;
  minDistance: any;
  moveTo?: any;
  "fitToBox(mesh)"?: any;
  setPosition?: any;
  setTarget?: any;
  setLookAt?: any;
  lerpLookAt?: any;
  saveState?: any;
  reset?: any;
  enabled: any;
  verticalDragToForward: any;
  dollyToCursor: any;
  infinityDolly: any;
};

function CameraModel(): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const cameraControlsRef = useRef<CameraControls>(null);

  const { camera } = useThree();

  const config: LevaConfig = {
    thetaGrp: buttonGroup({
      label: "rotate theta",
      opts: {
        "+45º": () => cameraControlsRef.current?.rotate(45 * DEG2RAD, 0, true),
        "-90º": () => cameraControlsRef.current?.rotate(-90 * DEG2RAD, 0, true),
        "+360º": () =>
          cameraControlsRef.current?.rotate(360 * DEG2RAD, 0, true),
      },
    }),
    phiGrp: buttonGroup({
      label: "rotate phi",
      opts: {
        "+20º": () => cameraControlsRef.current?.rotate(0, 20 * DEG2RAD, true),
        "-40º": () => cameraControlsRef.current?.rotate(0, -40 * DEG2RAD, true),
      },
    }),
    truckGrp: buttonGroup({
      label: "truck",
      opts: {
        "(1,0)": () => cameraControlsRef.current?.truck(1, 0, true),
        "(0,1)": () => cameraControlsRef.current?.truck(0, 1, true),
        "(-1,-1)": () => cameraControlsRef.current?.truck(-1, -1, true),
      },
    }),
    dollyGrp: buttonGroup({
      label: "dolly",
      opts: {
        1: () => cameraControlsRef.current?.dolly(1, true),
        "-1": () => cameraControlsRef.current?.dolly(-1, true),
      },
    }),
    zoomGrp: buttonGroup({
      label: "zoom",
      opts: {
        "/2": () => cameraControlsRef.current?.zoom(camera.zoom / 2, true),
        "/-2": () => cameraControlsRef.current?.zoom(-camera.zoom / 2, true),
      },
    }),
    minDistance: { value: 0 },
    moveTo: folder(
      {
        vec1: { value: [3, 5, 2], label: "vec" },
        "moveTo(…vec)": button((get) =>
          cameraControlsRef.current?.moveTo(
            ...(get("moveTo.vec1") as [number, number, number]),
            true
          )
        ),
      },
      { collapsed: true }
    ),
    "fitToBox(mesh)": button(() =>
      cameraControlsRef.current?.fitToBox(meshRef.current!, true)
    ),
    setPosition: folder(
      {
        vec2: { value: [-5, 2, 1], label: "vec" },
        "setPosition(…vec)": button((get) =>
          cameraControlsRef.current?.setPosition(
            ...(get("setPosition.vec2") as [number, number, number]),
            true
          )
        ),
      },
      { collapsed: true }
    ),
    setTarget: folder(
      {
        vec3: { value: [3, 0, -3], label: "vec" },
        "setTarget(…vec)": button((get) =>
          cameraControlsRef.current?.setTarget(
            ...(get("setTarget.vec3") as [number, number, number]),
            true
          )
        ),
      },
      { collapsed: true }
    ),
    setLookAt: folder(
      {
        vec4: { value: [1, 2, 3], label: "position" },
        vec5: { value: [1, 1, 0], label: "target" },
        "setLookAt(…position, …target)": button((get) =>
          cameraControlsRef.current?.setLookAt(
            ...(get("setLookAt.vec4") as [number, number, number]),
            ...(get("setLookAt.vec5") as [number, number, number]),
            true
          )
        ),
      },
      { collapsed: true }
    ),
    lerpLookAt: folder(
      {
        vec6: { value: [-2, 0, 0], label: "posA" },
        vec7: { value: [1, 1, 0], label: "tgtA" },
        vec8: { value: [0, 2, 5], label: "posB" },
        vec9: { value: [-1, 0, 0], label: "tgtB" },
        t: { value: Math.random(), label: "t", min: 0, max: 1 },
        "f(…posA,…tgtA,…posB,…tgtB,t)": button((get) => {
          return cameraControlsRef.current?.lerpLookAt(
            ...(get("lerpLookAt.vec6") as [number, number, number]),
            ...(get("lerpLookAt.vec7") as [number, number, number]),
            ...(get("lerpLookAt.vec8") as [number, number, number]),
            ...(get("lerpLookAt.vec9") as [number, number, number]),
            get("lerpLookAt.t"),
            true
          );
        }),
      },
      { collapsed: true }
    ),
    saveState: button(() => cameraControlsRef.current?.saveState()),
    reset: button(() => cameraControlsRef.current?.reset(true)),
    enabled: { value: true, label: "controls on" },
    verticalDragToForward: {
      value: false,
      label: "vert. drag to move forward",
    },
    dollyToCursor: { value: false, label: "dolly to cursor" },
    infinityDolly: { value: false, label: "infinity dolly" },
  };

  return (
    <>
      <CameraControls
        makeDefault
        ref={cameraControlsRef}
        minDistance={config.minDistance}
        enabled={config.enabled}
        verticalDragToForward={config.verticalDragToForward}
        dollyToCursor={config.dollyToCursor}
        infinityDolly={config.infinityDolly}
      />
    </>
  );
}

export default CameraModel;
