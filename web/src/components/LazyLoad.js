import React, { useRef } from "react";
import useIntersectionObserver from "@react-hook/intersection-observer";

const LazyLoad = ({ paddingTop, children }) => {
  const containerRef = useRef();
  const lockRef = useRef(false);
  const { isIntersecting } = useIntersectionObserver(containerRef);
  if (isIntersecting) {
    lockRef.current = true;
  }
  return (
    <div
      style={{
        overflow: "hidden",
        paddingTop: paddingTop,
        position: "relative",
        width: "100%",
      }}
      ref={containerRef}
    >
      {lockRef.current && children}
    </div>
  );
};

export default LazyLoad;
