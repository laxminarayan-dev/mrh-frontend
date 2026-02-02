import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

/* distance */
function getDistanceKm(a, b) {
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

export default function Direction({ userPos, outlets, setDistance }) {
  const map = useMap();
  const routeRef = useRef(null);

  useEffect(() => {
    if (!userPos) return;

    let nearest = outlets[0];
    let min = Infinity;

    outlets.forEach((o) => {
      const d = getDistanceKm(userPos, o.position);
      if (d < min) {
        min = d;
        nearest = o;
      }
    });

    setDistance?.(min);

    if (routeRef.current) {
      map.removeControl(routeRef.current);
    }

    routeRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userPos[0], userPos[1]),
        L.latLng(nearest.position[0], nearest.position[1]),
      ],
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      createMarker: () => null,
      lineOptions: { styles: [{ color: "#f97316", weight: 4 }] },
    }).addTo(map);

    return () => {
      if (routeRef.current) {
        map.removeControl(routeRef.current);
        routeRef.current = null;
      }
    };
  }, [userPos, outlets, map, setDistance]);

  return null;
}
