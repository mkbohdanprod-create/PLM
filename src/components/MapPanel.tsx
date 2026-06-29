import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Order, Measurer } from '../types';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

interface MapPanelProps {
  orders: Order[];
  selectedOrder: Order;
  routeInfos: Record<string, any>;
  measurers: Measurer[];
  onSelectOrder: (order: Order) => void;
}

export function MapPanel({ orders, selectedOrder, routeInfos, measurers, onSelectOrder }: MapPanelProps) {
  return (
    <div className="panel map-panel">
      <div className="panel-header" style={{ position: 'absolute', zIndex: 1000, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', top: '10px', left: '10px', right: 'auto', borderRadius: '4px', border: '1px solid var(--border-color)', padding: '8px 12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 className="panel-title" style={{ fontSize: '12px' }}>Інтерактивна карта (Маршрутизатор)</h2>
      </div>

      <MapContainer 
        center={[selectedOrder?.lat || 50.4501, selectedOrder?.lng || 30.5234]} 
        zoom={13} 
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView center={[selectedOrder?.lat || 50.4501, selectedOrder?.lng || 30.5234]} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw Polylines for each measurer */}
        {measurers.map(measurer => {
          const info = routeInfos[measurer.id];
          if (!info || !info.geometry) return null;

          return (
            <Polyline 
              key={`route-${measurer.id}`} 
              positions={info.geometry} 
              pathOptions={{ color: measurer.color, weight: 5, opacity: 0.7, dashArray: '10, 10' }} 
            />
          );
        })}

        {/* Draw Markers */}
        {orders.filter(o => o.status !== 'PAUSED' && o.status !== 'CANCELLED' && o.lat && o.lng).map((order) => (
          <Marker 
            key={order.id} 
            position={[order.lat, order.lng]}
            opacity={selectedOrder && order.id === selectedOrder.id ? 1 : 0.6}
            zIndexOffset={selectedOrder && order.id === selectedOrder.id ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectOrder(order),
            }}
          >
            <Popup>
              <div style={{ fontWeight: 600 }}>{order.client}</div>
              <div>{order.address}</div>
              <div style={{ color: 'var(--accent-color)' }}>{order.id}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
