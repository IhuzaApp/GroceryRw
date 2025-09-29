import React, { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  fallback?: string;
  onError?: () => void;
  [key: string]: any;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  fallback = "/images/shop-placeholder.jpg",
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
      onError?.();
    }
  };

  // Suppress AbortError in console
  const handleLoad = () => {
    // Image loaded successfully
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fill={fill}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default SafeImage;
