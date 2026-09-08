import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useMapData } from './useMapData';
import TrailsLayer from './TrailsLayer';
import PointsLayer from './PointsLayer';

interface MapProps {
  id?: number | string | (number | string)[];
  pointId?: number | string | (number | string)[]; 
  onHover?: (event: React.MouseEvent<SVGElement>, trailId: number, ramalId?: string) => void;
  onClick?: (trailId: number, ramalId?: string) => void;
  onPointClick?: (pointName: string, trailId?: number) => void;
  onLeave?: () => void;
  highlight?: number | string | (number | string)[]; 
  previewGeoJson?: any;
  previewColor?: string;
  onDeleteLine?: (featureIndex: number) => void; // Callback para deleção
}

const MAP_CENTER: [number, number] = [-23.678, -45.4395]; 

const isLine = (feature: any) => {
  const type = feature?.geometry?.type;
  return type === 'LineString' || type === 'MultiLineString';
};

function FitGeoJsonBounds({ geojson }: { geojson: any }) {
  const map = useMap();

  useEffect(() => {
    if (!geojson) return;
    try {
      const layer = L.geoJSON(geojson, { filter: isLine });
      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch (err) {
      console.error("Erro ao enquadrar o mapa no GeoJSON:", err);
    }
  }, [geojson, map]);

  return null;
}

export default function Map({ 
  id, 
  pointId, 
  onHover, 
  onClick, 
  onPointClick, 
  onLeave, 
  highlight,
  previewGeoJson,
  previewColor = "#000000",
  onDeleteLine
}: MapProps) {
  const { filteredData, isLineHighlighted, isPointHighlighted } = useMapData(id, highlight, pointId);

  const handleEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        if (!onDeleteLine || !previewGeoJson?.features) return;

        const featureIndex = previewGeoJson.features.indexOf(feature);
        const nomeLinha = feature.properties?.name || `Linha ${featureIndex + 1}`;

        if (window.confirm(`Deseja remover "${nomeLinha}" da rota?`)) {
          onDeleteLine(featureIndex);
        }
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 7, opacity: 1 });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({ weight: 4, opacity: 0.9 });
      }
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '350px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={MAP_CENTER} 
        zoom={50} 
        scrollWheelZoom={false}
        dragging={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        {previewGeoJson ? (
          <>
            <GeoJSON 
              key={JSON.stringify(previewGeoJson)} 
              data={previewGeoJson} 
              style={{ color: previewColor, weight: 4, opacity: 0.9 }} 
              filter={isLine}
              onEachFeature={handleEachFeature}
            />
            <FitGeoJsonBounds geojson={previewGeoJson} />
          </>
        ) : (
          <>
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
          </>
        )}
      </MapContainer>
    </div>
  );
}