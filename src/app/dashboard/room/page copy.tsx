"use client";
import styles from "@/styles/world/index.module.css";
import { Canvas } from "@react-three/fiber";
import {
  Cloud,
  Clouds,
  Html,
  Sky,
  useProgress,
} from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Lights from "./_components/Lights";
import { useStateContext } from "./_components/StateContext";
import Player from "./_components/Player";
import Ground from "./_components/Ground";
export default function PlayWorld({ info }) {
  const { systemInfo, setModelList } = useStateContext();

  useEffect(() => {
    setModelList(info.models);
  }, [info.models]);


  return (
    <div className={styles["editor"]}>
      <Canvas
        shadows
        camera={{ position: [0, 3, 2], far: 50, fov: 75, near: 0.1 }}
      >
        <Lights />
        <color attach="background" args={[systemInfo.sceneColor]} />
        <fog attach="fog" args={["#fff", 10, 60]} />
        {/* <Environment preset={systemInfo.sceneEvn} background blur={0.78} /> */}
        {info?.system_data?.openSky && <Sky sunPosition={[100, 100, 100]} />}
        <Suspense fallback={<Loader />}>
          <Physics colliders={false}>
            <Ground />
            <Player />
          </Physics>

          <Clouds material={THREE.MeshBasicMaterial}>
            <Cloud seed={10} bounds={20} volume={30} position={[0, 40, 0]} />
          </Clouds>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}
