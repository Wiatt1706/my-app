import { useEffect, useRef, useState } from "react";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useInput } from "./useInput";

type DirectionOffsetInput = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0);
let rotateQuarternion = new THREE.Quaternion();
let cameraTarget = new THREE.Vector3();

const directionOffset = ({
  forward,
  backward,
  left,
  right,
}: DirectionOffsetInput): number => {
  let directionOffset = 0;

  if (forward) {
    if (left) {
      directionOffset = Math.PI / 4; // w+a
    }
    if (right) {
      directionOffset = -Math.PI / 4; // w+d
    }
  } else if (backward) {
    if (left) {
      directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
    } else if (right) {
      directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
    } else {
      directionOffset = Math.PI; // s
    }
  } else if (left) {
    directionOffset = Math.PI / 2; // a
  } else if (right) {
    directionOffset = -Math.PI / 2; // d
  }

  return directionOffset;
};

const Player: React.FC = () => {
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [directionLight, setDirectionLight] = useState<
    THREE.DirectionalLight | undefined
  >();

  const model = useGLTF("/glb/player.glb") as any; // Add appropriate GLTF typing if available

  const { forward, backward, left, right, shift, jump } = useInput();
  const { actions } = useAnimations(model.animations, model.scene);

  const currentAction = useRef<string>("");
  const controlsRef = useRef<any>();
  const camera = useThree((state) => state.camera);
  const { scene } = useThree();

  const updateLightTarget = (moveX: number, moveZ: number) => {
    if (directionLight) {
      directionLight.position.x += moveX;
      directionLight.position.z += moveZ;
    }
  };

  const updateCameraTarget = (moveX: number, moveZ: number) => {
    camera.position.x += moveX;
    camera.position.z += moveZ;

    cameraTarget.set(
      model.scene.position.x,
      model.scene.position.y + 2,
      model.scene.position.z
    );

    if (controlsRef.current) {
      controlsRef.current.target.copy(cameraTarget);
    }
  };

  useEffect(() => {
    model.scene.traverse((object: THREE.Object3D) => {
      if ((object as THREE.Mesh).isMesh) {
        (object as THREE.Mesh).castShadow = true;
      }
    });

    scene.traverse((child) => {
      if (child instanceof THREE.DirectionalLight) {
        child.target = model.scene;
        setDirectionLight(child);
      }
    });
  }, [model.scene, scene]);

  useEffect(() => {
    let action = "";
    setAutoRotate(false);

    if (forward || backward || left || right) {
      action = "walking";
      if (shift) {
        action = "running";
      }
    } else if (jump) {
      action = "jump";
    } else {
      action = "idle";
    }

    if (currentAction.current !== action) {
      const nextActionToPlay = actions?.[action];
      const current = actions?.[currentAction.current];
      current?.fadeOut(0.3);
      nextActionToPlay?.reset().fadeIn(0.3).play();
      currentAction.current = action;
    }
  }, [actions, forward, backward, left, right, shift, jump]);

  useFrame((state, delta) => {
    if (
      currentAction.current === "running" ||
      currentAction.current === "walking"
    ) {
      const angleYCameraDirection = Math.atan2(
        camera.position.x - model.scene.position.x,
        camera.position.z - model.scene.position.z
      );

      const newDirectionOffset = directionOffset({
        forward,
        backward,
        left,
        right,
      });

      rotateQuarternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + newDirectionOffset
      );
      model.scene.quaternion.rotateTowards(rotateQuarternion, 0.2);

      camera.getWorldDirection(walkDirection);
      walkDirection.y = 0;
      walkDirection.normalize();
      walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);

      const velocity = currentAction.current === "running" ? 8 : 3;

      const moveX = walkDirection.x * velocity * delta;
      const moveZ = walkDirection.z * velocity * delta;

      model.scene.position.x += moveX;
      model.scene.position.z += moveZ;

      updateLightTarget(moveX, moveZ);
      updateCameraTarget(moveX, moveZ);
    }
  });

  return (
    <>
      <OrbitControls
        enablePan={false}
        enableDamping
        maxPolarAngle={Math.PI / 2}
        autoRotate={autoRotate}
        dampingFactor={0.1}
        minDistance={1}
        maxDistance={5}
        ref={controlsRef}
      />
      <RigidBody colliders="ball" restitution={0.7}>
        <mesh castShadow receiveShadow position={[1, 13, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </RigidBody>
      <primitive object={model.scene} />
    </>
  );
};

export default Player;
