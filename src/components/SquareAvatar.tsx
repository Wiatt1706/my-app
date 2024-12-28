import React from "react";
import Image from "next/image";

interface SquareAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  size?: number;
  alt?: string;
}

const SquareAvatar = ({
  url,
  size = 100,
  alt = "Avatar",
  className,
  ...props
}: SquareAvatarProps) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
      }}
      {...props}
    >
      <Image
        src={url}
        alt={alt}
        width={size}
        height={size}
        style={{ objectFit: "cover" }}
        priority
      />
    </div>
  );
};

export default SquareAvatar;
