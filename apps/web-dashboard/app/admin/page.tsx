"use client";
import dynamic from "next/dynamic";
const BeaconPointAdmin = dynamic(() => import("../../../../BeaconPointAdmin.jsx"), { ssr: false });

export default function AdminPage() {
  return <BeaconPointAdmin />;
}
