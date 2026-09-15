import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import SimpleButton from '../buttons/SimpleButton';

interface RecenterButtonProps {
  center: [number, number];
  zoom?: number; // Prop opcional de zoom
}

export function RecenterButton({ center, zoom }: RecenterButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  const map = useMapEvents({
    moveend: () => {
      const currentCenter = map.getCenter();
      const originCenter = L.latLng(center[0], center[1]);
      
      const distance = currentCenter.distanceTo(originCenter);
      
      // Se a distância for maior que 50 metros, mostra o botão
      if (distance > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  });

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '20px',  // Posição na parte de baixo
        right: '20px',   // Posição na direita
        zIndex: 1000     // Importante: zIndex > 400 para ficar acima do mapa
      }}
    >
      <SimpleButton
        onClick={(e) => {
          e.stopPropagation();
          // Usa o zoom recebido via prop ou mantém o zoom atual se for indefinido
          const targetZoom = zoom ?? map.getZoom();
          map.flyTo(center, targetZoom, { duration: 0.7 });
          setIsVisible(false);
        }}
        icon='Explorar'
        tema='dark'
      >
        Se perdeu?
      </SimpleButton>
    </div>
  );
}