import { Suspense } from "react";
import { Map } from "@/components/map/map";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="h-screen w-screen bg-white" />}>
      <Map />
    </Suspense>
  );
}