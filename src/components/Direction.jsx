import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Routes({ userPos, outlets, userIcon, onTooFar, setDistance }) {
  const map = useMap();
  const routeRef = useRef(null);

  useEffect(() => {
    if (!userPos || !outlets?.length) return;

    // 🔍 Find nearest outlet
    let nearest = outlets[0];
    let minDistance = Infinity;

    outlets.forEach((o) => {
      const d = getDistanceKm(
        userPos[0],
        userPos[1],
        o.position[0],
        o.position[1],
      );
      if (d < minDistance) {
        minDistance = d;
        nearest = o;
      }
    });

    // ❌ Too far → no routing
    if (minDistance > 10) {
      if (onTooFar) onTooFar(minDistance);

      // remove any existing route
      if (routeRef.current) {
        try {
          map.removeControl(routeRef.current);
        } catch (e) {}
        routeRef.current = null;
      }
      setTimeout(() => {
        onTooFar(null);
      }, 2000);
      return;
    }

    // ✅ Within range → show route
    if (onTooFar) {
      setDistance(minDistance);
      onTooFar(null);
    }

    // 🧹 Remove previous route
    if (routeRef.current) {
      try {
        map.removeControl(routeRef.current);
      } catch (e) {}
      routeRef.current = null;
    }

    routeRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userPos[0], userPos[1]),
        L.latLng(nearest.position[0], nearest.position[1]),
      ],
      lineOptions: {
        styles: [{ color: "#f97316", weight: 4 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,

      // 👇 IMPORTANT FIX
      show: false,
      collapsible: false,
      routeWhileDragging: false,
      showAlternatives: false,

      createMarker: (i, wp) => {
        if (i === 0 && userIcon) {
          return L.marker(wp.latLng, { icon: userIcon });
        }
        return null;
      },
    }).addTo(map);

    return () => {
      if (routeRef.current) {
        try {
          map.removeControl(routeRef.current);
        } catch (e) {}
        routeRef.current = null;
      }
    };
  }, [userPos, outlets, map, userIcon, onTooFar]);

  return null;
}

export default Routes;
