import { Suspense } from "react";
import { MapView } from "@/components/map/map";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="h-screen w-screen bg-white" />}>
      <MapView />
    </Suspense>
  );
}