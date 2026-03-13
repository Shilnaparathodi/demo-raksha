import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DisasterMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DisasterMap = ({ requests, alerts }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([10.5, 76.5], 7);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        requests.forEach(request => {
            const lat = 10.5 + (Math.random() - 0.5) * 2;
            const lng = 76.5 + (Math.random() - 0.5) * 2;

            const markerColor = request.priority === 5 ? 'red' :
                request.priority === 4 ? 'orange' :
                    request.priority === 3 ? 'yellow' :
                        request.priority === 2 ? 'blue' : 'green';

            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: `custom-marker priority-${request.priority}`,
                    html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                    iconSize: [20, 20]
                })
            }).addTo(mapInstanceRef.current);

            marker.bindPopup(`
        <b>${request.type.toUpperCase()} Request</b><br>
        Description: ${request.description}<br>
        Location: ${request.location}<br>
        Priority: ${request.priority}/5<br>
        People: ${request.people}<br>
        Status: ${request.status}
      `);

            markersRef.current.push(marker);
        });

        alerts.forEach(alert => {
            if (alert.lat && alert.lng) {
                const alertMarker = L.marker([alert.lat, alert.lng], {
                    icon: L.divIcon({
                        className: 'alert-marker',
                        html: `<div style="background-color: purple; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white;">⚠️</div>`,
                        iconSize: [25, 25]
                    })
                }).addTo(mapInstanceRef.current);

                alertMarker.bindPopup(`
          <b>${alert.type} Alert</b><br>
          Severity: ${alert.severity}<br>
          Country: ${alert.country}<br>
          Source: GDACS
        `);

                markersRef.current.push(alertMarker);
            }
        });

    }, [requests, alerts]);

    return <div ref={mapRef} className="disaster-map" />;
};

export default DisasterMap;
