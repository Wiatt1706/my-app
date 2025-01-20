"use client";

import { Canvas } from "@react-three/fiber";
import {
	CameraControls,
	PerspectiveCamera,
} from "@react-three/drei";
import { Level, Sudo, Camera, Cactus, Box } from "./_components/Scene";

export default function App() {

	return (
		<Canvas flat>
			<CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />
			<ambientLight intensity={0.01} />
			<hemisphereLight intensity={0.125} color="#8040df" groundColor="red" />
			<spotLight
				castShadow
				color="orange"
				intensity={400}
				position={[20, 10, 40]} // 动态位置
				angle={0.25}
				penumbra={1}
				shadow-mapSize={[128, 128]}
				shadow-bias={0.05}
			/>
			<directionalLight
				position={[0, 10, 10]}
				color={"#ff0000"}
				intensity={1.5}
			/>

			<group scale={20} position={[5, -11, -5]}>
				<Level />
				<Sudo />
				<Camera />
				<Cactus />
				<Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
			</group>
			{/* <Environment preset="city" background blur={1} /> */}
			<PerspectiveCamera makeDefault position={[0, 0, 18.5]} />
		</Canvas>
	);
}
