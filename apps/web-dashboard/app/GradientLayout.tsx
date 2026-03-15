"use client";
import React from "react";
import { GradientBackground } from "@beacon-point/ui";

export default function GradientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GradientBackground />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>{children}</div>
    </>
  );
}
