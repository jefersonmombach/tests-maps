"use client";

import { useEffect, useRef } from "react";

const CURITIBA_SOUTH_WEST: [number, number] = [-25.64, -49.39];
const CURITIBA_NORTH_EAST: [number, number] = [-25.31, -49.14];
const CURITIBA_CENTER: [number, number] = [-25.4284, -49.2733];
const INITIAL_ZOOM = 11;
const MAX_ZOOM = 19;
const TILESERV_BASE_URL = process.env.NEXT_PUBLIC_TILES_BASE_PATH ?? "/tiles";
const POINTS_LAYER_ID = "public.pontos_de_interesse";

type LeafletWithVectorGrid = {
  vectorGrid: {
    protobuf: (url: string, options?: Record<string, unknown>) => { addTo: (map: unknown) => void };
  };
};

export function CuritibaMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<{
    remove: () => void;
  } | null>(null);

  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) {
      return;
    }

    let isDisposed = false;

    const initializeMap = async () => {
      const leaflet = await import("leaflet");
      (window as typeof window & { L?: unknown }).L = leaflet;
      await import("leaflet.vectorgrid");

      if (isDisposed || !mapElementRef.current) {
        return;
      }

      const curitibaBounds = leaflet.latLngBounds(CURITIBA_SOUTH_WEST, CURITIBA_NORTH_EAST);

      const map = leaflet.map(mapElementRef.current, {
        center: CURITIBA_CENTER,
        zoom: INITIAL_ZOOM,
        maxBounds: curitibaBounds,
        maxBoundsViscosity: 1.0,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: MAX_ZOOM,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map);

      const leafletWithVectorGrid = leaflet as unknown as LeafletWithVectorGrid;

      leafletWithVectorGrid.vectorGrid
        .protobuf(`${TILESERV_BASE_URL}/${POINTS_LAYER_ID}/{z}/{x}/{y}.pbf`, {
          interactive: true,
          maxZoom: MAX_ZOOM,
          vectorTileLayerStyles: {
            pontos_de_interesse: {
              radius: 5,
              weight: 1,
            },
            [POINTS_LAYER_ID]: {
              radius: 5,
              weight: 1,
            },
          },
        })
        .addTo(map);

      map.fitBounds(curitibaBounds);
      mapInstanceRef.current = map;
    };

    void initializeMap();

    return () => {
      isDisposed = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapElementRef} className="h-screen w-screen" />;
}