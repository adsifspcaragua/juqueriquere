import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Essencial para o mapa não quebrar visualmente

import { useMapData } from './useMapData';
import TrailsLayer from './TrailsLayer';
import PointsLayer from './PointsLayer';

//revisar visual mais tarde

interface MapProps {
  id?: number | string | (number | string)[]; // Tipagem atualizada para bater com o hook
  pointId?: number | string | (number | string)[]; // <-- NOVO: adicionado o pointId
  onHover?: (event: React.MouseEvent<SVGElement>, trailId: number, ramalId?: string) => void;
  onClick?: (trailId: number, ramalId?: string) => void;
  onPointClick?: (pointName: string, trailId?: number) => void;
  onLeave?: () => void;
  highlight?: number | string | (number | string)[]; 
}

// Coordenadas centrais aproximadas (ajustável)
const MAP_CENTER: [number, number] = [-23.678, -45.4395]; 

export default function Map({ 
  id, 
  pointId, 
  onHover, 
  onClick, 
  onPointClick, 
  onLeave, 
  highlight
}: MapProps) {
  const { filteredData, isLineHighlighted, isPointHighlighted } = useMapData(id, highlight, pointId);

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '600px' }}>
      <MapContainer 
        center={MAP_CENTER} 
        zoom={50} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Camada de Satélite (Esri World Imagery) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        <TrailsLayer 
          lines={filteredData.lines}
          isLineHighlighted={isLineHighlighted}
          onHover={onHover}
          onClick={onClick}
          onLeave={onLeave}
        />

        <PointsLayer 
          points={filteredData.points}
          isPointHighlighted={isPointHighlighted}
          onHover={onHover}
          onClick={onClick}
          onPointClick={onPointClick}
          onLeave={onLeave}
        />
      </MapContainer>
    </div>
  );
}