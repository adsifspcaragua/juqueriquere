import { useEffect } from 'react';

// Converte latitude/longitude em coordenada X/Y do tile
function latLngToTileXY(lat: number, lng: number, zoom: number) {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad))) / Math.PI) / 2 * Math.pow(2, zoom)
  );
  return { x, y };
}

// Calcula as margens Norte, Sul, Leste e Oeste com base em um raio em metros
function getBoundingBox(center: [number, number], radiusInMeters: number) {
  const [lat, lng] = center;
  
  // 1 grau de latitude ≈ 111.000m
  const latOffset = radiusInMeters / 111000;
  
  // 1 grau de longitude varia conforme a latitude
  const lngOffset = radiusInMeters / (111000 * Math.cos((lat * Math.PI) / 180));

  return {
    north: lat + latOffset,
    south: lat - latOffset,
    east: lng + lngOffset,
    west: lng - lngOffset,
  };
}

export function useAutoCacheMap(center: [number, number], radiusMeters = 500) {
  useEffect(() => {
    const cacheKey = `map_tiles_cached_${center[0].toFixed(4)}_${center[1].toFixed(4)}_${radiusMeters}m`;
    
    // Se já foi baixado anteriormente para essas coordenadas, não baixa de novo
    if (localStorage.getItem(cacheKey)) {
      return;
    }

    async function prefetchTiles() {
      try {
        const cache = await caches.open('esri-map-tiles');
        const box = getBoundingBox(center, radiusMeters);

        // Níveis de zoom que cobrem navegação próxima e detalhada
        const zoomLevels = [15, 16, 17, 18];
        const urlsToFetch: string[] = [];

        zoomLevels.forEach((z) => {
          const nw = latLngToTileXY(box.north, box.west, z);
          const se = latLngToTileXY(box.south, box.east, z);

          const minX = Math.min(nw.x, se.x);
          const maxX = Math.max(nw.x, se.x);
          const minY = Math.min(nw.y, se.y);
          const maxY = Math.max(nw.y, se.y);

          for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
              urlsToFetch.push(
                `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
              );
            }
          }
        });

        // Baixa em lotes em segundo plano para não congelar o navegador
        for (const url of urlsToFetch) {
          const match = await cache.match(url);
          if (!match) {
            fetch(url, { mode: 'cors' }).then((res) => {
              if (res.ok) cache.put(url, res);
            }).catch(() => {});
          }
        }

        // Marca como concluído
        localStorage.setItem(cacheKey, 'true');
        console.log(`[Offline Map] ${urlsToFetch.length} tiles salvos para uso offline.`);
      } catch (error) {
        console.warn('[Offline Map] Não foi possível salvar os tiles automaticamente:', error);
      }
    }

    // Executa em segundo plano quando a CPU estiver ociosa
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => prefetchTiles());
    } else {
      setTimeout(prefetchTiles, 1000);
    }
  }, [center, radiusMeters]);
}