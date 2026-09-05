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
        
        const coords = (item.feature.geometry as any).coordinates;
        const position: [number, number] = [coords[1], coords[0]]; 

        return (
          <CircleMarker
            key={`point-${idx}`}
            center={position}
            // Pontos não destacados continuam visíveis, mas ficam menores (raio 3)
            radius={highlighted ? 6 : 3}
            fillColor="#fbc02d"
            color="#fae208"
            weight={highlighted ? 2 : 1}
            fillOpacity={highlighted ? 1 : 0.3} // Ficam meio transparentes no fundo
            interactive={true} // Permite clicar em pontos de outras trilhas
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
            <Tooltip>{item.feature.properties?.name || item.pointName}</Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}