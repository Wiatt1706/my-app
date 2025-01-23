import { Html } from "@react-three/drei";

export function HtmlModel({ ...props }) {
  return (
    <Html
      {...props}
      style={{ userSelect: "none", pointerEvents: "none" }}
      castShadow
      receiveShadow
      occlude="blending"
      transform
      zIndexRange={[100, 0]}
    >
      <iframe
        width={300}
        height={300}
        title="embed"
        src="https://threejs.org/"
      />
    </Html>
  );
}
