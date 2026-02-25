"use client";

import { useEffect, useRef } from "react";
import type { LatLngExpression } from "leaflet";

const SOUTH_WEST: [number, number] = [-22.9, -42.4];
const NORTH_EAST: [number, number] = [-21.5, -40.8];
const CENTER: [number, number] = [-22.37, -41.78];
const INITIAL_ZOOM = 16;
const MAX_ZOOM = 19;
const MIN_FETCH_ZOOM = 8;
const MAX_FETCH_ZOOM = 14;
const TILESERV_BASE_URL = process.env.NEXT_PUBLIC_TILES_BASE_PATH || "/tiles";
const POINTS_LAYER_ID = "pontos_de_interesse";
const BOAT_ICON_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#0f766e" d="M9 40h46l-7 9H16z"/><path fill="#14b8a6" d="M17 31h30v9H17z"/><path fill="#ffffff" d="M29 12l13 11H29z"/><path fill="#0f766e" d="M28 12h2v20h-2z"/></svg>',
  );

type PointProperties = {
  nome?: string;
  categoria?: string;
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

function parsePointProperties(input: unknown): PointProperties {
  if (!input || typeof input !== "object") {
    return {};
  }

  const record = input as Record<string, unknown>;
  return {
    nome: typeof record.nome === "string" ? record.nome : undefined,
    categoria: typeof record.categoria === "string" ? record.categoria : undefined,
  };
}

export function MapView() {
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

      const leafletWithPatchFlag = leaflet as typeof leaflet & {
        __vectorGridCircleMarkerPatched?: boolean;
      };

      if (!leafletWithPatchFlag.__vectorGridCircleMarkerPatched) {
        const originalGetLatLng = leaflet.CircleMarker.prototype.getLatLng;

        leaflet.CircleMarker.prototype.getLatLng = function getLatLngPatched() {
          const currentLatLng = originalGetLatLng.call(this);
          if (currentLatLng) {
            return currentLatLng;
          }

          const layerPoint = (this as unknown as { _point?: { x: number; y: number } })._point;
          const rendererMap = (this as unknown as { _renderer?: { _map?: unknown } })._renderer?._map;
          const mapRef = rendererMap as { layerPointToLatLng?: (point: { x: number; y: number }) => unknown } | undefined;

          if (layerPoint && mapRef?.layerPointToLatLng) {
            return mapRef.layerPointToLatLng(layerPoint) as ReturnType<typeof originalGetLatLng>;
          }

          return currentLatLng;
        };

        leafletWithPatchFlag.__vectorGridCircleMarkerPatched = true;
      }

      (
        globalThis as unknown as {
          L?: typeof leaflet;
        }
      ).L = leaflet;

      await import("leaflet.vectorgrid");

      if (isDisposed || !mapElementRef.current) {
        return;
      }

      const mapBounds = leaflet.latLngBounds(SOUTH_WEST, NORTH_EAST);

      const map = leaflet.map(mapElementRef.current, {
        center: CENTER,
        zoom: INITIAL_ZOOM,
        maxBounds: mapBounds,
        maxBoundsViscosity: 1.0,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: MAX_ZOOM,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map);

      map.fitBounds(mapBounds);

      const vectorGridFactory = (
        globalThis as unknown as {
          L?: {
            vectorGrid?: unknown;
          };
        }
      ).L?.vectorGrid as
        | {
            protobuf: (
              url: string,
              options: {
                minZoom: number;
                maxZoom: number;
                interactive: boolean;
                vectorTileLayerStyles: Record<
                  string,
                  Record<string, unknown> | ((properties: unknown, zoom: number) => Record<string, unknown>)
                >;
              },
            ) => {
              addTo: (mapRef: unknown) => void;
              on?: (eventName: string, handler: (event: unknown) => void) => void;
            };
          }
        | undefined;

      if (!vectorGridFactory?.protobuf) {
        console.error("Leaflet.VectorGrid protobuf não está disponível.");
        mapInstanceRef.current = map;
        return;
      }

      const boatIcon = leaflet.icon({
        iconUrl: BOAT_ICON_SVG,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -10],
      });

      // Martin publica a tabela como /{table_name}/{z}/{x}/{y} (sem schema)
      const pointsLayer = vectorGridFactory.protobuf(`${TILESERV_BASE_URL}/${POINTS_LAYER_ID}/{z}/{x}/{y}`, {
        minZoom: MIN_FETCH_ZOOM,
        maxZoom: MAX_ZOOM,
        interactive: true,
        vectorTileLayerStyles: {
          [POINTS_LAYER_ID]: () => ({
            icon: boatIcon,
          }),
        },
      });

      pointsLayer.on?.("click", (event: unknown) => {
        const typedEvent = event as {
          latlng?: LatLngExpression;
          originalEvent?: MouseEvent;
          layer?: { properties?: unknown };
        };

        const popupLatLng = typedEvent.originalEvent
          ? map.mouseEventToLatLng(typedEvent.originalEvent)
          : typedEvent.latlng;

        if (!popupLatLng) {
          return;
        }

        const properties = parsePointProperties(typedEvent.layer?.properties);
        leaflet.popup().setLatLng(popupLatLng).setContent(buildPopupContent(properties)).openOn(map);
      });

      pointsLayer.addTo(map);

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