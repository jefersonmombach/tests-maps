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
const TILESERV_BASE_URL = process.env.NEXT_PUBLIC_TILES_BASE_PATH ?? "/tiles";
const POINTS_LAYER_ID = "public.pontos_de_interesse";
const POINTS_LAYER_NAME = "pontos_de_interesse";
const BOAT_ICON_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#0f766e" d="M9 40h46l-7 9H16z"/><path fill="#14b8a6" d="M17 31h30v9H17z"/><path fill="#ffffff" d="M29 12l13 11H29z"/><path fill="#0f766e" d="M28 12h2v20h-2z"/></svg>',
  );

type PointProperties = {
  nome?: string;
  categoria?: string;
};

type GeoJsonPointGeometry = {
  type: "Point";
  coordinates: [number, number];
};

type GeoJsonFeature = {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
  properties?: Record<string, unknown>;
};

type VectorTileLayerType = {
  length: number;
  feature: (index: number) => {
    toGeoJSON: (x: number, y: number, z: number) => GeoJsonFeature;
  };
};

type VectorTileType = {
  layers: Record<string, VectorTileLayerType | undefined>;
};

type PointFeature = {
  latlng: LatLngExpression;
  properties: PointProperties;
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

function longitudeToTileX(longitude: number, zoom: number): number {
  const scale = 2 ** zoom;
  return Math.floor(((longitude + 180) / 360) * scale);
}

function latitudeToTileY(latitude: number, zoom: number): number {
  const scale = 2 ** zoom;
  const latitudeInRadians = (latitude * Math.PI) / 180;
  const mercatorProjection = Math.log(Math.tan(latitudeInRadians) + 1 / Math.cos(latitudeInRadians));
  return Math.floor(((1 - mercatorProjection / Math.PI) / 2) * scale);
}

async function fetchPointsFromTileserv(bounds: [[number, number], [number, number]], zoom: number): Promise<PointFeature[]> {
  const [southWest, northEast] = bounds;
  const minX = longitudeToTileX(southWest[1], zoom);
  const maxX = longitudeToTileX(northEast[1], zoom);
  const minY = latitudeToTileY(northEast[0], zoom);
  const maxY = latitudeToTileY(southWest[0], zoom);

  const tileCoordinates: Array<{ x: number; y: number }> = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      tileCoordinates.push({ x, y });
    }
  }

  const [{ VectorTile }, pbfModule] = await Promise.all([import("@mapbox/vector-tile"), import("pbf")]);
  const Pbf = pbfModule.default;

  const allFeatures: PointFeature[][] = [];
  for (const { x, y } of tileCoordinates) {
    try {
      const response = await fetch(`${TILESERV_BASE_URL}/${POINTS_LAYER_ID}/${zoom}/${x}/${y}.pbf`, {
        cache: "no-store",
      });

      if (!response.ok) {
        allFeatures.push([]);
        continue;
      }

      const binaryTile = await response.arrayBuffer();
      const vectorTile = new VectorTile(new Pbf(new Uint8Array(binaryTile))) as unknown as VectorTileType;
      const layer = vectorTile.layers[POINTS_LAYER_NAME] ?? vectorTile.layers[POINTS_LAYER_ID];

      if (!layer) {
        allFeatures.push([]);
        continue;
      }

      const features: PointFeature[] = [];
      for (let index = 0; index < layer.length; index += 1) {
        const feature = layer.feature(index).toGeoJSON(x, y, zoom) as GeoJsonFeature;
        if (feature.geometry?.type !== "Point") {
          continue;
        }

        if (!Array.isArray(feature.geometry.coordinates) || feature.geometry.coordinates.length < 2) {
          continue;
        }

        const longitude = feature.geometry.coordinates[0];
        const latitude = feature.geometry.coordinates[1];
        if (typeof longitude !== "number" || typeof latitude !== "number") {
          continue;
        }

        const rawNome = feature.properties?.nome;
        const rawCategoria = feature.properties?.categoria;
        features.push({
          latlng: [latitude, longitude],
          properties: {
            nome: typeof rawNome === "string" ? rawNome : undefined,
            categoria: typeof rawCategoria === "string" ? rawCategoria : undefined,
          },
        });
      }

      allFeatures.push(features);
    } catch {
      allFeatures.push([]);
    }
  }

  const deduplicated = new Map<string, PointFeature>();

  for (const tileFeatures of allFeatures) {
    for (const tileFeature of tileFeatures) {
      const [latitude, longitude] = tileFeature.latlng as [number, number];
      const dedupeKey = `${latitude}|${longitude}|${tileFeature.properties.nome ?? ""}`;
      if (!deduplicated.has(dedupeKey)) {
        deduplicated.set(dedupeKey, tileFeature);
      }
    }
  }

  return Array.from(deduplicated.values());
}

export function Map() {
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

      const visibleBounds = map.getBounds();
      const fetchZoom = Math.max(MIN_FETCH_ZOOM, Math.min(MAX_FETCH_ZOOM, map.getZoom()));
      const points = await fetchPointsFromTileserv(
        [
          [visibleBounds.getSouthWest().lat, visibleBounds.getSouthWest().lng],
          [visibleBounds.getNorthEast().lat, visibleBounds.getNorthEast().lng],
        ],
        fetchZoom,
      );

      if (isDisposed) {
        return;
      }

      const boatIcon = leaflet.icon({
        iconUrl: BOAT_ICON_SVG,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -10],
      });

      for (const point of points) {
        leaflet
          .marker(point.latlng, { icon: boatIcon })
          .addTo(map)
          .bindPopup(buildPopupContent(point.properties));
      }

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