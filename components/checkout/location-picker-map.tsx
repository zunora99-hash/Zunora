"use client";

// OpenStreetMap tiles must be requested directly from the tile server, not optimized by Next.js.
/* eslint-disable @next/next/no-img-element */

import type { FormEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type Coordinates = { latitude: number; longitude: number };

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: Record<string, unknown>;
};

const TILE_SIZE = 256;
const DEFAULT_CENTER = { latitude: 15.8497, longitude: 74.4977 };

function project({ latitude, longitude }: Coordinates, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const radians = (Math.max(-85.0511, Math.min(85.0511, latitude)) * Math.PI) / 180;
  return {
    x: ((longitude + 180) / 360) * scale,
    y: ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * scale
  };
}

function unproject(x: number, y: number, zoom: number): Coordinates {
  const scale = TILE_SIZE * 2 ** zoom;
  return {
    longitude: (x / scale) * 360 - 180,
    latitude: (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale))) * 180) / Math.PI
  };
}

function isPhotonFeature(value: unknown): value is PhotonFeature {
  if (!value || typeof value !== "object" || !("geometry" in value) || !("properties" in value)) return false;
  const geometry = value.geometry;
  return Boolean(geometry && typeof geometry === "object" && "coordinates" in geometry &&
    Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2 &&
    typeof geometry.coordinates[0] === "number" && typeof geometry.coordinates[1] === "number" &&
    value.properties && typeof value.properties === "object");
}

function featureLabel({ properties }: PhotonFeature) {
  return [properties.name, properties.street, properties.city ?? properties.town ?? properties.village, properties.state]
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ") || "Map result";
}

export function LocationPickerMap({ position, onSelect }: {
  position: Coordinates | null;
  onSelect: (coordinates: Coordinates) => void;
}) {
  const [center, setCenter] = useState(position ?? DEFAULT_CENTER);
  const [zoom, setZoom] = useState(position ? 16 : 15);
  const [mapMode, setMapMode] = useState<"street" | "satellite">("street");
  const [size, setSize] = useState({ width: 640, height: 340 });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    centerX: number;
    centerY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const element = mapRef.current;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!position) return;
    setCenter(position);
  }, [position?.latitude, position?.longitude]);

  const tileZoom = Math.floor(zoom);
  const displayScale = 2 ** (zoom - tileZoom);
  const worldCenter = useMemo(() => project(center, tileZoom), [center, tileZoom]);
  const topLeftX = worldCenter.x - size.width / (2 * displayScale);
  const topLeftY = worldCenter.y - size.height / (2 * displayScale);
  const tiles = useMemo(() => {
    const tileCount = 2 ** tileZoom;
    const firstX = Math.floor(topLeftX / TILE_SIZE);
    const firstY = Math.floor(topLeftY / TILE_SIZE);
    const columns = Math.ceil(size.width / (TILE_SIZE * displayScale)) + 2;
    const rows = Math.ceil(size.height / (TILE_SIZE * displayScale)) + 2;
    return Array.from({ length: columns * rows }, (_, index) => {
      const x = firstX + index % columns;
      const y = firstY + Math.floor(index / columns);
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      const source = mapMode === "satellite"
        ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${tileZoom}/${y}/${wrappedX}`
        : `https://tile.openstreetmap.org/${tileZoom}/${wrappedX}/${y}.png`;
      return {
        key: `${mapMode}/${tileZoom}/${x}/${y}`,
        src: source,
        left: (x * TILE_SIZE - topLeftX) * displayScale,
        top: (y * TILE_SIZE - topLeftY) * displayScale,
        visible: y >= 0 && y < tileCount
      };
    });
  }, [displayScale, mapMode, size.height, size.width, tileZoom, topLeftX, topLeftY]);

  async function searchAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const params = new URLSearchParams({ q: trimmedQuery, limit: "5", lat: String(center.latitude), lon: String(center.longitude) });
      const response = await fetch(`https://photon.komoot.io/api/?${params}`, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error("Map search is unavailable. Pan the map and tap your location instead.");
      const data: unknown = await response.json();
      const features = data && typeof data === "object" && "features" in data && Array.isArray(data.features)
        ? data.features.filter(isPhotonFeature)
        : [];
      if (!features.length) throw new Error("No matching places found. Try another search or tap the map.");
      setResults(features);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Map search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function chooseResult(feature: PhotonFeature) {
    const [longitude, latitude] = feature.geometry.coordinates;
    onSelect({ latitude, longitude });
    setResults([]);
  }

  function startPan(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a, input, select, label")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      centerX: worldCenter.x,
      centerY: worldCenter.y,
      moved: false
    };
  }

  function pan(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.clientX;
    const dy = event.clientY - drag.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (drag.moved) setCenter(unproject(drag.centerX - dx / displayScale, drag.centerY - dy / displayScale, tileZoom));
  }

  function finishPanOrPick(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved) {
      const rect = event.currentTarget.getBoundingClientRect();
      onSelect(unproject(
        worldCenter.x + (event.clientX - rect.left - rect.width / 2) / displayScale,
        worldCenter.y + (event.clientY - rect.top - rect.height / 2) / displayScale,
        tileZoom
      ));
    }
    dragRef.current = null;
  }

  const marker = position ? project(position, tileZoom) : null;

  function changeZoom(delta: number) {
    setZoom((value) => Math.max(3, Math.min(19, Number((value + delta).toFixed(2)))));
  }

  return (
    <div className="grid gap-3">
      <form onSubmit={searchAddress} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search street, area, or landmark"
          aria-label="Search for your delivery location"
          className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" disabled={searching} className="rounded-md border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-60">
          {searching ? "Searching..." : "Search map"}
        </button>
      </form>
      {results.length ? (
        <div className="grid gap-1 rounded-md border bg-background p-2" aria-label="Map search results">
          {results.map((feature, index) => (
            <button key={`${featureLabel(feature)}-${index}`} type="button" onClick={() => chooseResult(feature)} className="rounded px-3 py-2 text-left text-sm hover:bg-muted">
              {featureLabel(feature)}
            </button>
          ))}
        </div>
      ) : null}
      {searchError ? <p role="status" className="text-sm text-muted-foreground">{searchError}</p> : null}
      <div
        ref={mapRef}
        role="application"
        aria-label="Delivery location map. Drag to move the map, or tap to place the delivery pin."
        className="relative h-[340px] select-none touch-none overflow-hidden rounded-lg border bg-[#e7e5df]"
        onPointerDown={startPan}
        onPointerMove={pan}
        onPointerUp={finishPanOrPick}
        onPointerCancel={() => { dragRef.current = null; }}
        onWheel={(event) => {
          event.preventDefault();
          const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? event.deltaY * size.height
              : event.deltaY;
          changeZoom(-delta * 0.0025);
        }}
      >
        {tiles.map((tile) => tile.visible ? (
          <img key={tile.key} src={tile.src} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ left: tile.left, top: tile.top, width: TILE_SIZE * displayScale, height: TILE_SIZE * displayScale }} />
        ) : null)}
        {marker ? (
          <div aria-hidden="true" className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full drop-shadow-md" style={{ left: (marker.x - topLeftX) * displayScale, top: (marker.y - topLeftY) * displayScale }}>
            <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
              <path d="M17 1C8.16 1 1 8.16 1 17c0 11.2 16 24 16 24s16-12.8 16-24C33 8.16 25.84 1 17 1Z" fill="#9C3D22" stroke="white" strokeWidth="2" />
              <circle cx="17" cy="17" r="5" fill="white" />
            </svg>
          </div>
        ) : null}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-md border bg-white/95 p-1 shadow" onWheel={(event) => event.stopPropagation()}>
          <button type="button" aria-label="Zoom out slowly" onClick={() => changeZoom(-0.25)} disabled={zoom <= 3} className="h-8 w-8 rounded text-lg font-semibold hover:bg-muted disabled:opacity-40">−</button>
          <input type="range" min="3" max="19" step="0.1" value={zoom} aria-label="Map zoom level" onChange={(event) => setZoom(Number(event.target.value))} className="w-24 accent-[#5b6f3a]" />
          <button type="button" aria-label="Zoom in slowly" onClick={() => changeZoom(0.25)} disabled={zoom >= 19} className="h-8 w-8 rounded text-lg font-semibold hover:bg-muted disabled:opacity-40">+</button>
          <span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">{zoom.toFixed(1)}</span>
        </div>
        <div className="absolute left-3 top-3 z-20 flex overflow-hidden rounded-md border bg-white/95 shadow">
          <button type="button" aria-pressed={mapMode === "street"} onClick={() => setMapMode("street")} className={`px-3 py-2 text-xs font-semibold ${mapMode === "street" ? "bg-cacao text-white" : "hover:bg-muted"}`}>Map</button>
          <button type="button" aria-pressed={mapMode === "satellite"} onClick={() => setMapMode("satellite")} className={`border-l px-3 py-2 text-xs font-semibold ${mapMode === "satellite" ? "bg-cacao text-white" : "hover:bg-muted"}`}>Satellite</button>
        </div>
        <button type="button" onClick={() => onSelect(center)} className="absolute bottom-8 left-3 z-20 rounded-md border bg-white/95 px-3 py-2 text-xs font-semibold shadow hover:bg-white">
          Pin map center
        </button>
        {mapMode === "street" ? (
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="absolute bottom-0 right-0 z-20 bg-white/90 px-1.5 py-0.5 text-[10px] text-[#333]">© OpenStreetMap contributors</a>
        ) : (
          <a href="https://www.esri.com/en-us/home" target="_blank" rel="noreferrer" className="absolute bottom-0 right-0 z-20 bg-white/90 px-1.5 py-0.5 text-[10px] text-[#333]">Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community</a>
        )}
      </div>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {position
          ? `Pinned coordinates: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}. Search, zoom, or tap the map to refine the delivery point.`
          : "Search an address, zoom to the exact spot, and tap the map to place the delivery pin."}
        {mapMode === "street" ? " Map data © OpenStreetMap contributors." : " Satellite imagery © Esri and its imagery providers."}
      </p>
    </div>
  );
}
