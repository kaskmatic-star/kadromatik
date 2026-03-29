import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const JobMapView = ({ jobs }) => {
  // Center of Turkey (approximately)
  const position = [39.9334, 32.8597];

  // Helper to add mock coords if not present (stable based on ID)
  const jobsWithCoords = jobs.map((job) => {
    // Deterministic random-like values based on string ID
    const seed = job.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      ...job,
      lat: job.lat || 38.0 + (seed % 50) / 10, // Distributed around Turkey
      lng: job.lng || 30.0 + (seed % 100) / 10
    };
  });

  return (
    <div className="job-map-container rounded-3xl overflow-hidden shadow-2xl border-4 border-white" style={{ height: '600px', width: '100%', zIndex: 10 }}>
      <MapContainer center={position} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {jobsWithCoords.map((job) => (
          <Marker key={job.id} position={[job.lat, job.lng]}>
            <Popup className="custom-popup">
              <div className="p-2">
                <h4 className="font-bold text-primary mb-1">{job.title}</h4>
                <p className="text-xs font-bold mb-2">{job.company}</p>
                <div className="text-xs text-success font-black mb-3">{job.wage}</div>
                <Link to={`/is/${job.id}`} className="btn btn-primary py-2 px-4 text-xs w-full block text-center rounded-lg">
                  DETAYLARI GÖR
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default JobMapView;
