import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/* distance in KM */
export const getDistanceKm = (a, b) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
    Math.cos((b[0] * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function Direction({
  userPos,
  outlets = [],
  setDistance,
  setDestination,
}) {
  const map = useMap();
  const routeRef = useRef(null);
  const abortRef = useRef(null);
  const hasDrawnRef = useRef(false); // 🔒 block duplicate calls

  useEffect(() => {
    if (!map || !userPos || outlets.length === 0) return;
    if (hasDrawnRef.current) return; // 🚨 stop reruns

    /* find nearest outlet */
    let nearest = outlets[0];
    let min = Infinity;

    for (const o of outlets) {
      const d = getDistanceKm(userPos, o.position);
      if (d < min) {
        min = d;
        nearest = o;
      }
    }

    setDistance?.(min);
    setDestination?.(nearest.position);

    /* cleanup old route */
    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    /* abort previous request */
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    async function drawRoute() {
      try {
        const res = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            method: "POST",
            signal: abortRef.current.signal,
            headers: {
              Authorization: import.meta.env.VITE_ORS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coordinates: [
                [userPos[1], userPos[0]],
                [nearest.position[1], nearest.position[0]],
              ],
            }),
          },
        );

        if (!res.ok) throw new Error(`ORS ${res.status}`);
        hasDrawnRef.current = true;

        const data = await res.json();

        const latlngs = data.features[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng],
        );

        routeRef.current = L.polyline(latlngs, {
          color: "#f97316",
          weight: 4,
        }).addTo(map);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("ORS routing failed", err);
        }
      }
    }

    drawRoute();

    return () => {
      abortRef.current?.abort();
    };
  }, [map, userPos?.[0], userPos?.[1]]); // 🔑 stable deps

  return null;
}
