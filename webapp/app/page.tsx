import { Suspense } from "react";
import { CuritibaMap } from "@/components/map/curitiba-map";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="h-screen w-screen bg-white" />}>
      <CuritibaMap />
    </Suspense>
  );
}