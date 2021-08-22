import React, { useRef } from "react";
import useIntersectionObserver from "@react-hook/intersection-observer";

const Youtube = ({ url }) => {
  const containerRef = useRef();
  const lockRef = useRef(false);
  const { isIntersecting } = useIntersectionObserver(containerRef);
  if (isIntersecting) {
    lockRef.current = true;
  }
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        margin: "10px",
      }}
      ref={containerRef}
    >
      {lockRef.current && (
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/NUTi2r4u2-g"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="video"
        />
      )}
    </div>
  );
};

export default Youtube;
