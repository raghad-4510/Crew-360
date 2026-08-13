
import { useEffect, useRef } from "react";
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
import "leaflet/dist/leaflet.css";

export default function StationMap({
    onZoneChange,
}: {
    onZoneChange: (data: {
        zone: "green" | "blue" | "outside";
        latitude: number;
        longitude: number;
        distance: number;
        gpsAccuracy: number;
    }) => void;
}) {

    console.log("StationMap Loaded");

   const mapRef = useRef<HTMLDivElement>(null);
const leafletMap = useRef<L.Map | null>(null);
const employeeMarker = useRef<L.Marker | null>(null);
  useEffect(() => {
    if (!mapRef.current) return;

    let map: L.Map;

    async function initMap() {
      const response = await fetch(
        "http://localhost/smart-attendance/api/get_station.php"
      );

      const station = await response.json();
      console.log(station);
      const lat = Number(station.latitude);
      const lng = Number(station.longitude);

      if (leafletMap.current) return;

leafletMap.current = L.map(mapRef.current!).setView([lat, lng], 14);

map = leafletMap.current;
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
        }
      ).addTo(map);

      
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(station.station_name)
        

      
      L.circle([lat, lng], {
        radius: Number(station.attendance_radius),
        color: "green",
        fillOpacity: 0.15,
      }).addTo(map);

      // Blue monitoring zone
      L.circle([lat, lng], {
        radius: Number(station.monitoring_radius),
        color: "blue",
        fillOpacity: 0.08,
      }).addTo(map);
    navigator.geolocation.watchPosition(
  (position) => {

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    if (employeeMarker.current) {
      employeeMarker.current.setLatLng([userLat, userLng]);
    } else {
      employeeMarker.current = L.marker([userLat, userLng])
        .addTo(map)
        .bindPopup("You");
    }

    
    map.panTo([userLat, userLng]);

    // Calculate distance
    const distance = getDistance(
      userLat,
      userLng,
      lat,
      lng
    );

    console.log(distance.toFixed(0) + " meters");

    
   let zone: "green" | "blue" | "outside" = "outside";

if (distance <= Number(station.attendance_radius)) {
    zone = "green";
} else if (distance <= Number(station.monitoring_radius)) {
    zone = "blue";
}

onZoneChange({
    zone,
    latitude: userLat,
    longitude: userLng,
    distance,
    gpsAccuracy: position.coords.accuracy,
});

console.log("Zone:", zone);
  },
  (error) => {
    console.error(error);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0,
  }
);
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
    }

    initMap();

    return () => {
      if (map) {
       leafletMap.current?.remove();
leafletMap.current = null;
      }
    };
  }, []);

  return (
  <div
    ref={mapRef}
    style={{
      width: "100%",
      height: "280px",
      minHeight: "200px",
    }}
  />
);
}