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
        if (!highlighted) return null; // Remove as que não estão em destaque (ou ajuste opacity se preferir manter no DOM)

        const strokeColor = item.feature.properties?.stroke || "#4CAF50";

        return (
          <GeoJSON
            key={`trail-${idx}-${highlighted}`}
            data={item.feature}
            style={{
              color: strokeColor,
              weight: 6,
              opacity: highlighted ? 0.8 : 0.3,
              lineCap: 'round',
              lineJoin: 'round'
            }}
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
        );
      })}
    </>
  );
}