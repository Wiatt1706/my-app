"use client";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Lights from "./_components/Lights";
import { StateProvider } from "./_components/StateContext";
import Player from "./_components/Player";
import Ground from "./_components/Ground";
import { Level, Sudo, Camera, Cactus, Box } from "./_components/Scene";
export default function PlayWorld() {

  return (
    <StateProvider>
      <Canvas
        className="bg-background"
        shadows
        camera={{ position: [0, 3, 2], far: 50, fov: 75, near: 0.1 }}
      >
        <Lights />
        <Physics colliders={false}>
          <group scale={1.8} position={[5, -0.3, -5]}>
            <Level />
            <Sudo />
            <Camera />
            <Cactus />
            <Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
          </group>
          <Ground />
          <Player />
        </Physics>
      </Canvas>
    </StateProvider>
  );
}


