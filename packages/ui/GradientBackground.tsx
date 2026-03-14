import React from "react";
import { accentColor } from "./theme";

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(334deg, rgb(0,0,0) 56%, rgb(54,38,55) 100%)",
        color: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    >
      {children}
    </div>
  );
}
