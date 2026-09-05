import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { type Feature } from 'geojson';

interface TrailsLayerProps {
  lines: Array<{ feature: Feature; trailId?: number; ramalId?: string }>;
  isLineHighlighted: (trailId?: number, ramalId?: string) => boolean;
  onHover?: (event: React.MouseEvent<SVGElement>, trailId: number, ramalId?: string) => void;
  onClick?: (trailId: number, ramalId?: string) => void;
  onLeave?: () => void;
}

export default function TrailsLayer({ lines, isLineHighlighted, onHover, onClick, onLeave }: TrailsLayerProps) {
  return (
    <>
      {lines.map((item, idx) => {
        const highlighted = isLineHighlighted(item.trailId, item.ramalId);
        const strokeColor = item.feature.properties?.stroke || "#4CAF50";

        return (
          <React.Fragment key={`trail-group-${idx}-${highlighted}`}>
            <GeoJSON
              data={item.feature}
              style={{
                color: 'transparent',
                weight: 20, 
                opacity: 0,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              interactive={true}
              eventHandlers={{
                mouseover: (e) => {
                  const domEvent = e.originalEvent as unknown as React.MouseEvent<SVGElement>;
                  if (item.trailId) onHover?.(domEvent, item.trailId, item.ramalId);
                },
                mouseout: () => onLeave?.(),
                click: () => {
                  if (item.trailId) onClick?.(item.trailId, item.ramalId);
                }
              }}
            />
            <GeoJSON
              data={item.feature}
              style={{
                color: strokeColor,
                weight: highlighted ? 10 : 7,
                opacity: highlighted ? 0.9 : 0.25,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              interactive={false} 
            />
          </React.Fragment>
        );
      })}
    </>
  );
}