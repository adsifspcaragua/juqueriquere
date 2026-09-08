import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import SimpleButton from '../buttons/SimpleButton';

export function RecenterButton({ center }: { center: [number, number] }) {
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
          map.flyTo(center, map.getZoom(), { duration: 0.7 });
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