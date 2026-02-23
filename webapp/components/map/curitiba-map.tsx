"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

const CURITIBA_BOUNDS = L.latLngBounds(
  L.latLng(-25.64, -49.39),
  L.latLng(-25.31, -49.14),
);

const CURITIBA_CENTER = L.latLng(-25.4284, -49.2733);
const INITIAL_ZOOM = 11;
const MAX_ZOOM = 19;

export function CuritibaMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) {
      return;
    }

    const map = L.map(mapElementRef.current, {
      center: CURITIBA_CENTER,
      zoom: INITIAL_ZOOM,
      maxBounds: CURITIBA_BOUNDS,
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: MAX_ZOOM,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.fitBounds(CURITIBA_BOUNDS);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapElementRef} className="h-screen w-screen" />;
}