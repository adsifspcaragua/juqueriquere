import { CircleMarker, Tooltip } from 'react-leaflet';
import { type Feature } from 'geojson';

interface PointsLayerProps {
  points: Array<{ feature: Feature; trailId?: number; pointName: string }>;
  isPointHighlighted: (pointName?: string, trailId?: number) => boolean;
  onHover?: (event: React.MouseEvent<SVGElement>, trailId: number, ramalId?: string) => void;
  onClick?: (trailId: number, ramalId?: string) => void;
  onPointClick?: (pointName: string, trailId?: number) => void;
  onLeave?: () => void;
}

export default function PointsLayer({ points, isPointHighlighted, onHover, onClick, onPointClick, onLeave }: PointsLayerProps) {
  return (
    <>
      {points.map((item, idx) => {
        const highlighted = isPointHighlighted(item.pointName, item.trailId);
        
        // GeoJSON é [longitude, latitude], Leaflet usa [latitude, longitude]
        const coords = (item.feature.geometry as any).coordinates;
        const position: [number, number] = [coords[1], coords[0]]; 

        return (
          <CircleMarker
            key={`point-${idx}`}
            center={position}
            radius={highlighted ? 6 : 0} // Esconde se não destacado
            fillColor="#fbc02d"
            color="#fae208"
            weight={2}
            fillOpacity={1}
            interactive={highlighted}
            eventHandlers={{
              mouseover: (e) => {
                const domEvent = e.originalEvent as unknown as React.MouseEvent<SVGElement>;
                if (item.trailId) onHover?.(domEvent, item.trailId);
              },
              mouseout: () => onLeave?.(),
              click: (e) => {
                e.originalEvent.stopPropagation();
                if (onPointClick && item.pointName) {
                  onPointClick(item.pointName, item.trailId);
                } else if (item.trailId) {
                  onClick?.(item.trailId);
                }
              }
            }}
          >
            <Tooltip>{item.feature.properties?.name}</Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}