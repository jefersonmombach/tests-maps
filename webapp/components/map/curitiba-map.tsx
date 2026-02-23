"use client";

import { useEffect, useRef } from "react";
import type { LatLngExpression } from "leaflet";

const CURITIBA_SOUTH_WEST: [number, number] = [-25.64, -49.39];
const CURITIBA_NORTH_EAST: [number, number] = [-25.31, -49.14];
const CURITIBA_CENTER: [number, number] = [-25.4284, -49.2733];
const INITIAL_ZOOM = 11;
const MAX_ZOOM = 19;
const TILESERV_BASE_URL = process.env.NEXT_PUBLIC_TILES_BASE_PATH ?? "/tiles";
const POINTS_LAYER_ID = "public.pontos_de_interesse";
const PIN_ICON_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#dc2626" d="M12 2c-3.866 0-7 3.134-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>',
  );

type LeafletWithVectorGrid = {
  vectorGrid: {
    protobuf: (url: string, options?: Record<string, unknown>) => {
      addTo: (map: unknown) => {
        on: (eventName: string, handler: (event: VectorGridClickEvent) => void) => void;
      };
      on: (eventName: string, handler: (event: VectorGridClickEvent) => void) => void;
    };
  };
};

type PointProperties = {
  nome?: string;
  categoria?: string;
};

type VectorGridClickEvent = {
  latlng?: LatLngExpression;
  originalEvent?: MouseEvent;
  layer?: {
    getLatLng?: () => LatLngExpression;
    properties?: PointProperties;
  };
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPopupContent(properties: PointProperties | undefined): string {
  const nome = properties?.nome ?? "Não informado";
  const categoria = properties?.categoria ?? "Não informada";

  return `<div>
  <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
  <p><strong>Categoria:</strong> ${escapeHtml(categoria)}</p>
  <button type="button">Lançar informação</button>
</div>`;
}

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
      const pointsPinIcon = leaflet.icon({
        iconUrl: PIN_ICON_SVG,
        iconSize: [28, 28],
        iconAnchor: [14, 26],
        popupAnchor: [0, -24],
      });

      const pointsLayer = leafletWithVectorGrid.vectorGrid
        .protobuf(`${TILESERV_BASE_URL}/${POINTS_LAYER_ID}/{z}/{x}/{y}.pbf`, {
          interactive: true,
          maxZoom: MAX_ZOOM,
          vectorTileLayerStyles: {
            pontos_de_interesse: {
              icon: pointsPinIcon,
            },
            [POINTS_LAYER_ID]: {
              icon: pointsPinIcon,
            },
          },
        })
        .addTo(map);

      pointsLayer.on("click", (event) => {
        const popupLatLng =
          event.layer?.getLatLng?.() ??
          event.latlng ??
          (event.originalEvent ? map.mouseEventToLatLng(event.originalEvent) : undefined);

        if (!popupLatLng) {
          return;
        }

        leaflet
          .popup()
          .setLatLng(popupLatLng)
          .setContent(buildPopupContent(event.layer?.properties))
          .openOn(map);
      });

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